
'use client';
// Этот файл будет содержать логику для взаимодействия с контроллером
// через TCP (с использованием сервера-моста) и BLE.

import { ControllerCommandType, type ControllerStateUpdate, type Room, type ControllerInfo } from '@/types';
import {toast} from '@/hooks/use-toast'; // Используем реальный toast для UI фидбека

const CONTROLLER_BLE_NAME = 'ROOM_19'; // Имя BLE контроллера для прямого подключения
const CONTROLLER_BLE_SERVICE_UUID = 0x00FF; // Пример UUID сервиса из вашего плана
const CONTROLLER_BLE_CHARACTERISTIC_UUID = 0xFF02; // Пример UUID характеристики из вашего плана
const CONTROLLER_TOKEN = 'SNQaq6KVIQQMHR3x'; // Токен для аутентификации с контроллером

let bleCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let isConnecting = false;

/**
 * Устанавливает соединение с BLE-контроллером.
 */
export const connectViaWebBluetooth = async (bleName: string): Promise<BluetoothRemoteGATTCharacteristic | null> => {
  if (isConnecting) {
    console.log('[ControllerAPI] BLE connection already in progress.');
    // Можно добавить toast, если это пользовательская операция
    return bleCharacteristic; // Возвращаем текущую или null, если еще не установлено
  }
  if (bleCharacteristic) {
    console.log('[ControllerAPI] Already connected to BLE device.');
    return bleCharacteristic;
  }

  if (!navigator.bluetooth) {
    console.error('[ControllerAPI] Web Bluetooth is not available in this browser.');
    toast({ title: "BLE Error", description: "Web Bluetooth не доступен в этом браузере.", variant: "destructive" });
    return null;
  }

  isConnecting = true;
  console.log(`[ControllerAPI] Attempting to connect to BLE device: ${bleName}`);
  toast({ title: "BLE", description: `Попытка подключения к ${bleName}...` });

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: bleName }],
      optionalServices: [CONTROLLER_BLE_SERVICE_UUID],
    });

    if (!device.gatt) {
      console.error('[ControllerAPI] No GATT server found on the device.');
      toast({ title: "BLE Error", description: "GATT сервер не найден на устройстве.", variant: "destructive" });
      isConnecting = false;
      return null;
    }

    console.log('[ControllerAPI] Connecting to GATT server...');
    const server = await device.gatt.connect();
    console.log('[ControllerAPI] Connected to GATT server.');

    console.log(`[ControllerAPI] Getting primary service: 0x${CONTROLLER_BLE_SERVICE_UUID.toString(16)}`);
    const service = await server.getPrimaryService(CONTROLLER_BLE_SERVICE_UUID);
    console.log('[ControllerAPI] Got primary service.');

    console.log(`[ControllerAPI] Getting characteristic: 0x${CONTROLLER_BLE_CHARACTERISTIC_UUID.toString(16)}`);
    const characteristic = await service.getCharacteristic(CONTROLLER_BLE_CHARACTERISTIC_UUID);
    console.log('[ControllerAPI] Got characteristic.');

    // TODO: Реализовать аутентификацию токеном
    // console.log(`[ControllerAPI] Writing token ${CONTROLLER_TOKEN} to characteristic...`);
    // await characteristic.writeValue(new TextEncoder().encode(CONTROLLER_TOKEN));
    // console.log('[ControllerAPI] Token written.');

    toast({ title: "BLE Connected", description: `Успешно подключено к ${bleName}.` });
    bleCharacteristic = characteristic;
    isConnecting = false;
    return characteristic;
  } catch (error) {
    console.error('[ControllerAPI] Web Bluetooth connection failed:', error);
    toast({ title: "BLE Error", description: `Ошибка подключения к ${bleName}: ${(error as Error).message}`, variant: "destructive" });
    bleCharacteristic = null;
    isConnecting = false;
    return null;
  }
};

/**
 * Отправляет команду контроллеру или запрашивает данные.
 * Теперь пытается использовать Web Bluetooth.
 */
export const sendCommandToController = async (
  roomId: string, // roomId может быть использован для выбора TCP target, если BLE недоступен
  commandType: ControllerCommandType,
  payload?: ControllerStateUpdate | any
): Promise<Partial<Room> | ControllerInfo | null> => {
  console.log(`[ControllerAPI] Command for room ${roomId}:`, { commandType, payload });

  // Для прямого подключения используем известный BLE Name
  // В будущем можно добавить логику выбора TCP/BLE
  if (!bleCharacteristic && !isConnecting) {
    // Попытка подключиться, если еще не подключены
     await connectViaWebBluetooth(CONTROLLER_BLE_NAME);
  }

  if (!bleCharacteristic) {
    console.warn('[ControllerAPI] BLE characteristic not available. Cannot send command.');
    // toast({ title: "BLE Error", description: "Нет соединения с контроллером.", variant: "destructive" });
    // Возвращаем null, если команда не GET_INFO, чтобы UI не зависал в ожидании
     if (commandType === ControllerCommandType.GET_INFO && roomId === CONTROLLER_BLE_NAME) {
       // Если это запрос инфо для известного контроллера, и BLE не удалось, все равно вернем мок
        console.warn('[ControllerAPI] BLE connection failed for GET_INFO. Returning predefined info for ROOM_19.');
        return {
            macAddress: "A2:DD:6C:98:2E:58",
            ipAddress: "192.168.1.100",
            bleName: "ROOM_19",
            token: "SNQaq6KVIQQMHR3x"
        } as ControllerInfo;
    }
    return null;
  }

  try {
    if (commandType === ControllerCommandType.SET_STATE && payload) {
      console.log(`[ControllerAPI] Attempting to send SET_STATE to ${CONTROLLER_BLE_NAME}: ${JSON.stringify(payload)}`);
      // TODO: Реализовать кодирование payload и запись в bleCharacteristic.
      // Например: const dataToWrite = encodeSetStateCommand(payload);
      // await bleCharacteristic.writeValue(dataToWrite);
      console.log(`[ControllerAPI] Successfully sent SET_STATE (simulated write)`);
      // Для оптимистичного обновления UI возвращаем payload
      return payload as Partial<Room>;
    }

    if (commandType === ControllerCommandType.GET_STATE) {
      console.log(`[ControllerAPI] Attempting to GET_STATE from ${CONTROLLER_BLE_NAME}`);
      // TODO: Реализовать чтение из bleCharacteristic и декодирование состояния.
      // const value = await bleCharacteristic.readValue();
      // const state = decodeState(value); return state;
      console.log(`[ControllerAPI] GET_STATE (simulated read) - returning null as real data not fetched.`);
      return null; // Реальные данные пока не читаем
    }

    if (commandType === ControllerCommandType.GET_INFO) {
      // Если мы здесь, значит bleCharacteristic существует
      console.log(`[ControllerAPI] Attempting to GET_INFO from ${CONTROLLER_BLE_NAME} (already connected).`);
      // TODO: Реализовать чтение информации с контроллера, если она отличается от статической.
      // const value = await bleCharacteristic.readValue(); // если get_info тоже читается с той же характеристики
      // const info = decodeInfo(value); return info;
      console.log(`[ControllerAPI] GET_INFO (simulated read) - returning predefined info for ROOM_19.`);
      return {
        macAddress: "A2:DD:6C:98:2E:58",
        ipAddress: "192.168.1.100",
        bleName: "ROOM_19",
        token: "SNQaq6KVIQQMHR3x"
      } as ControllerInfo;
    }
  } catch (error) {
    console.error(`[ControllerAPI] Error during BLE communication for command ${commandType}:`, error);
    toast({ title: "BLE Command Error", description: `Ошибка при выполнении команды: ${(error as Error).message}`, variant: "destructive" });
    // Если произошла ошибка с характеристикой (например, устройство отключилось), сбрасываем ее
    if (deviceDisconnected(error)) { // deviceDisconnected - гипотетическая функция проверки типа ошибки
        bleCharacteristic = null; 
        // Можно также попытаться переподключиться или уведомить пользователя о необходимости переподключения
    }
    return null;
  }

  console.warn(`[ControllerAPI] Unknown command type: ${commandType}`);
  return null;
};

// Гипотетическая функция для проверки, связана ли ошибка с отключением устройства
function deviceDisconnected(error: any): boolean {
    if (error instanceof DOMException && error.name === 'NetworkError') {
        // Часто NetworkError означает, что GATT сервер недоступен (устройство отключилось)
        return true;
    }
    // Можно добавить другие проверки специфичные для ошибок Web Bluetooth
    return false;
}

// Функции-заглушки для кодирования/декодирования команд - нужно будет реализовать
// function encodeSetStateCommand(payload: ControllerStateUpdate): BufferSource {
//   // ... ваша логика кодирования в бинарный формат для BLE
//   return new Uint8Array([...]);
// }
// function decodeState(value: DataView): Partial<Room> {
//   // ... ваша логика декодирования состояния из DataView
//   return { lightsOn: value.getUint8(0) === 1 };
// }
// function decodeInfo(value: DataView): ControllerInfo {
//    // ... ваша логика декодирования информации о контроллере из DataView
//   return { macAddress: "...", ... };
// }

// TODO: Добавить функцию для разрыва BLE соединения, если пользователь уходит со страницы комнаты или выходит из системы.
export const disconnectFromBLE = async () => {
    if (bleCharacteristic && bleCharacteristic.service?.device?.gatt?.connected) {
        try {
            console.log("[ControllerAPI] Disconnecting from BLE device...");
            bleCharacteristic.service.device.gatt.disconnect();
            toast({title: "BLE Disconnected", description: "Отключено от BLE устройства."});
        } catch (error) {
            console.error("[ControllerAPI] Error disconnecting from BLE:", error);
            toast({title: "BLE Error", description: "Ошибка при отключении от BLE.", variant: "destructive"});
        }
    }
    bleCharacteristic = null;
    isConnecting = false;
};
