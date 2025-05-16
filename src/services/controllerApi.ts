
'use client';
// Этот файл будет содержать логику для взаимодействия с контроллером
// через BLE.

import { ControllerCommandType, type ControllerStateUpdate, type Room, type ControllerInfo } from '@/types';
import {toast} from '@/hooks/use-toast';

const CONTROLLER_BLE_NAME = 'ROOM_19'; // Имя BLE контроллера для прямого подключения
const CONTROLLER_BLE_SERVICE_UUID = 0x00FF; // Сервис для команд и данных
const CONTROLLER_BLE_CHARACTERISTIC_UUID = 0xFF02; // Характеристика для команд и данных
const CONTROLLER_TOKEN = 'SNQaq6KVIQQMHR3x'; // Токен для аутентификации с контроллером

let bleCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let bleServer: BluetoothRemoteGATTServer | null = null;
let isConnecting = false;
let isAuthenticated = false; // Флаг для отслеживания статуса аутентификации

const textEncoder = new TextEncoder(); // Для кодирования токена в UTF-8

// Примерный протокол команд (байт 0 - тип, байт 1 - значение)
const COMMAND_TYPE_LIGHT = 0x01;
const COMMAND_TYPE_LOCK = 0x02;

const VALUE_ON = 0x01;
const VALUE_OFF = 0x00;
const VALUE_UNLOCK = 0x01; // doorLocked: false
const VALUE_LOCK = 0x00;   // doorLocked: true


/**
 * Устанавливает соединение с BLE-контроллером и производит аутентификацию.
 */
export const connectViaWebBluetooth = async (bleName: string): Promise<boolean> => {
  if (isConnecting) {
    console.log('[ControllerAPI] BLE подключение уже в процессе.');
    toast({ title: "BLE", description: "Подключение уже в процессе..." });
    return isAuthenticated;
  }
  if (bleCharacteristic && bleServer?.connected && isAuthenticated) {
    console.log('[ControllerAPI] Уже подключено и аутентифицировано с BLE устройством.');
    return true;
  }

  if (!navigator.bluetooth) {
    console.error('[ControllerAPI] Web Bluetooth не доступен в этом браузере.');
    toast({ title: "BLE Ошибка", description: "Web Bluetooth не доступен в этом браузере.", variant: "destructive" });
    return false;
  }

  isConnecting = true;
  isAuthenticated = false; // Сбрасываем флаг при новой попытке подключения
  console.log(`[ControllerAPI] Попытка подключения к BLE устройству: ${bleName}`);
  toast({ title: "BLE", description: `Попытка подключения к ${bleName}...` });

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: bleName, services: [CONTROLLER_BLE_SERVICE_UUID] }],
      // optionalServices: [CONTROLLER_BLE_SERVICE_UUID], // Можно оставить, если сервис не рекламный
    });

    if (!device.gatt) {
      console.error('[ControllerAPI] GATT сервер не найден на устройстве.');
      toast({ title: "BLE Ошибка", description: "GATT сервер не найден на устройстве.", variant: "destructive" });
      isConnecting = false;
      return false;
    }

    device.addEventListener('gattserverdisconnected', onDisconnected);

    console.log('[ControllerAPI] Подключение к GATT серверу...');
    bleServer = await device.gatt.connect();
    console.log('[ControllerAPI] Подключено к GATT серверу.');
    toast({ title: "BLE", description: "GATT сервер подключен." });

    console.log(`[ControllerAPI] Получение основного сервиса: 0x${CONTROLLER_BLE_SERVICE_UUID.toString(16)}`);
    const service = await bleServer.getPrimaryService(CONTROLLER_BLE_SERVICE_UUID);
    console.log('[ControllerAPI] Сервис получен.');

    console.log(`[ControllerAPI] Получение характеристики: 0x${CONTROLLER_BLE_CHARACTERISTIC_UUID.toString(16)}`);
    const characteristic = await service.getCharacteristic(CONTROLLER_BLE_CHARACTERISTIC_UUID);
    console.log('[ControllerAPI] Характеристика получена.');
    
    bleCharacteristic = characteristic; // Сохраняем характеристику до аутентификации

    // Шаг 2: Аутентификация - запись токена
    console.log(`[ControllerAPI] Попытка аутентификации: запись токена "${CONTROLLER_TOKEN}"`);
    toast({ title: "BLE", description: "Аутентификация..." });
    const tokenData = textEncoder.encode(CONTROLLER_TOKEN);
    await bleCharacteristic.writeValueWithoutResponse(tokenData); // Используем WithoutResponse для простоты, если контроллер позволяет
    console.log('[ControllerAPI] Токен успешно записан (предполагается успешная аутентификация).');
    toast({ title: "BLE Аутентификация", description: "Токен отправлен. Предполагается успех." });
    isAuthenticated = true; // Устанавливаем флаг после "успешной" отправки токена
    
    isConnecting = false;
    return true;

  } catch (error) {
    console.error('[ControllerAPI] Ошибка подключения или аутентификации Web Bluetooth:', error);
    toast({ title: "BLE Ошибка", description: `Ошибка подключения/аутентификации: ${(error as Error).message}`, variant: "destructive" });
    if (bleServer?.connected) {
      bleServer.disconnect();
    }
    bleCharacteristic = null;
    bleServer = null;
    isAuthenticated = false;
    isConnecting = false;
    return false;
  }
};

function onDisconnected() {
  console.log('[ControllerAPI] BLE устройство отключено.');
  toast({ title: "BLE Отключено", description: "Соединение с контроллером потеряно.", variant: "destructive" });
  bleCharacteristic = null;
  bleServer = null;
  isAuthenticated = false;
  isConnecting = false;
}

/**
 * Отправляет команду контроллеру или запрашивает данные.
 */
export const sendCommandToController = async (
  roomId: string,
  commandType: ControllerCommandType,
  payload?: ControllerStateUpdate | any
): Promise<Partial<Room> | ControllerInfo | null> => {
  console.log(`[ControllerAPI] Команда для комнаты ${roomId}:`, { commandType, payload });

  if (roomId !== CONTROLLER_BLE_NAME) {
      console.warn(`[ControllerAPI] Попытка отправить команду комнате ${roomId}, но настроено только для ${CONTROLLER_BLE_NAME}`);
      toast({title: "Ошибка", description: `Этот интерфейс настроен только для ${CONTROLLER_BLE_NAME}`, variant: "destructive"});
      return null;
  }

  if (!bleCharacteristic || !bleServer?.connected || !isAuthenticated) {
    console.log('[ControllerAPI] Нет активного BLE соединения или аутентификации. Попытка подключения...');
    const connectionSuccessful = await connectViaWebBluetooth(CONTROLLER_BLE_NAME);
    if (!connectionSuccessful) {
      console.warn('[ControllerAPI] Не удалось подключиться и аутентифицироваться. Команда не отправлена.');
      toast({ title: "BLE Ошибка", description: "Не удалось подключиться к контроллеру. Команда не отправлена.", variant: "destructive" });
      // Для GET_INFO все равно вернем мок, если это ROOM_19, чтобы UI не ломался
      if (commandType === ControllerCommandType.GET_INFO && roomId === CONTROLLER_BLE_NAME) {
        return {
            macAddress: "A2:DD:6C:98:2E:58",
            ipAddress: "192.168.1.100",
            bleName: "ROOM_19",
            token: "SNQaq6KVIQQMHR3x"
        } as ControllerInfo;
      }
      return null;
    }
  }

  // Если мы здесь, значит bleCharacteristic существует, соединение установлено и аутентификация пройдена
  try {
    if (commandType === ControllerCommandType.SET_STATE && payload && bleCharacteristic) {
      let dataToWrite: Uint8Array | null = null;

      if (payload.hasOwnProperty('lightsOn')) {
        console.log(`[ControllerAPI] Подготовка команды СВЕТ: ${payload.lightsOn ? 'ВКЛ' : 'ВЫКЛ'}`);
        dataToWrite = new Uint8Array([COMMAND_TYPE_LIGHT, payload.lightsOn ? VALUE_ON : VALUE_OFF]);
      } else if (payload.hasOwnProperty('doorLocked')) {
        // doorLocked: false (открыто/разблокировано) -> VALUE_UNLOCK
        // doorLocked: true (закрыто/заблокировано) -> VALUE_LOCK
        console.log(`[ControllerAPI] Подготовка команды ЗАМОК: ${payload.doorLocked ? 'ЗАБЛОКИРОВАТЬ' : 'РАЗБЛОКИРОВАТЬ'}`);
        dataToWrite = new Uint8Array([COMMAND_TYPE_LOCK, payload.doorLocked ? VALUE_LOCK : VALUE_UNLOCK]);
      } else if (payload.hasOwnProperty('channel1On')) {
        // TODO: Реализовать протокол для Channel 1, если это физический канал
        console.warn('[ControllerAPI] Управление Channel 1 через BLE не реализовано в этом прототипе.');
        toast({title: "Инфо", description: "Управление Channel 1 через BLE не реализовано."});
      } else if (payload.hasOwnProperty('channel2On')) {
        // TODO: Реализовать протокол для Channel 2, если это физический канал
        console.warn('[ControllerAPI] Управление Channel 2 через BLE не реализовано в этом прототипе.');
        toast({title: "Инфо", description: "Управление Channel 2 через BLE не реализовано."});
      }

      if (dataToWrite) {
        console.log(`[ControllerAPI] Отправка команды на ${CONTROLLER_BLE_NAME}: [${dataToWrite.join(', ')}]`);
        toast({ title: "BLE Команда", description: `Отправка команды: ${Object.keys(payload).join('')}...` });
        await bleCharacteristic.writeValueWithoutResponse(dataToWrite);
        console.log(`[ControllerAPI] Команда успешно отправлена на ${CONTROLLER_BLE_NAME}.`);
        toast({ title: "BLE Успех", description: `Команда ${Object.keys(payload).join('')} отправлена.` });
        return payload as Partial<Room>; // Оптимистичное обновление
      } else {
        console.warn('[ControllerAPI] SET_STATE не содержит известных ключей для управления (lightsOn, doorLocked).');
        return null;
      }
    }

    if (commandType === ControllerCommandType.GET_STATE) {
      console.log(`[ControllerAPI] Попытка GET_STATE с ${CONTROLLER_BLE_NAME}`);
      // TODO: Реализовать чтение из bleCharacteristic и декодирование состояния (температура, влажность и т.д.).
      // const value = await bleCharacteristic.readValue();
      // const state = decodeState(value); return state;
      console.warn(`[ControllerAPI] GET_STATE (чтение состояния датчиков) через BLE не реализовано.`);
      toast({ title: "Инфо", description: "Чтение состояния датчиков через BLE не реализовано." });
      return null;
    }

    if (commandType === ControllerCommandType.GET_INFO) {
      console.log(`[ControllerAPI] GET_INFO для ${CONTROLLER_BLE_NAME} (соединение установлено и аутентифицировано).`);
      // Эта информация обычно статична или получается во время установления соединения,
      // а не читается через команду после аутентификации.
      // Возвращаем статические данные, так как они не меняются.
      return {
        macAddress: "A2:DD:6C:98:2E:58",
        ipAddress: "192.168.1.100", // IP через BLE обычно не узнать, это для TCP моста
        bleName: CONTROLLER_BLE_NAME,
        token: CONTROLLER_TOKEN
      } as ControllerInfo;
    }
  } catch (error) {
    console.error(`[ControllerAPI] Ошибка во время BLE коммуникации для команды ${commandType}:`, error);
    toast({ title: "BLE Ошибка Команды", description: `Ошибка: ${(error as Error).message}`, variant: "destructive" });
    if (bleServer && !bleServer.connected) {
        onDisconnected(); // Обновляем состояние, если сервер отвалился
    }
    return null;
  }

  console.warn(`[ControllerAPI] Неизвестный тип команды: ${commandType}`);
  return null;
};


export const disconnectFromBLE = async () => {
    if (bleServer?.connected) {
        try {
            console.log("[ControllerAPI] Отключение от BLE устройства...");
            bleServer.disconnect(); // onDisconnected вызовется автоматически по событию
        } catch (error) {
            console.error("[ControllerAPI] Ошибка при отключении от BLE:", error);
            toast({title: "BLE Ошибка", description: "Ошибка при отключении.", variant: "destructive"});
            // Принудительно сбрасываем состояние, если disconnect() вызвал ошибку, но мог сработать
            onDisconnected();
        }
    } else {
        console.log("[ControllerAPI] Нет активного BLE соединения для отключения.");
    }
    // В любом случае, явно сбрасываем состояние здесь, если disconnect не был вызван или не отработал onDisconnected
    bleCharacteristic = null;
    bleServer = null;
    isAuthenticated = false;
    isConnecting = false;
};

// TODO: Рассмотреть возможность добавления слушателя изменений характеристики,
// если контроллер отправляет обновления состояния (например, датчиков) асинхронно.
// if (bleCharacteristic?.properties.notify) {
//   await bleCharacteristic.startNotifications();
//   bleCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
// }
// function handleCharacteristicValueChanged(event: Event) {
//   const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
//   // Декодировать и обновить состояние в приложении
// }
