
'use client';

import {
  ControllerCommandType,
  type ControllerStateUpdate,
  type Room,
  type ControllerInfo,
  type WebSocketMessage,
  type WebSocketResponse,
  CommunicationChannel,
} from '@/types';
import { toast } from '@/hooks/use-toast';

// --- WebSocket Bridge Configuration ---
const BRIDGE_WEBSOCKET_URL = 'ws://localhost:8080'; // Default URL for the Node.js bridge
let websocket: WebSocket | null = null;
let ожидающиеЗапросы: Map<string, (response: WebSocketResponse) => void> = new Map();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

// --- BLE Configuration ---
const CONTROLLER_BLE_NAME = 'ROOM_19';
const CONTROLLER_BLE_SERVICE_UUID = 0x00ff;
const CONTROLLER_BLE_CHARACTERISTIC_UUID = 0xff02;
const CONTROLLER_AUTH_TOKEN = 'SNQaq6KVIQQMHR3x'; // Token for BLE authentication

let bleCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
let bleServer: BluetoothRemoteGATTServer | null = null;
let isBleConnecting = false;
let isBleAuthenticated = false;
const textEncoder = new TextEncoder();

// --- Helper Functions ---
function генерироватьMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// --- WebSocket Bridge Communication ---

function connectWebSocketBridge(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      console.log('[ControllerAPI-WS] WebSocket уже подключен.');
      resolve();
      return;
    }

    if (websocket && websocket.readyState === WebSocket.CONNECTING) {
      console.log('[ControllerAPI-WS] WebSocket уже подключается.');
      // Можно добавить логику ожидания или вернуть промис, который разрешится при подключении
      // Для простоты пока просто выходим
      reject(new Error("WebSocket подключение уже в процессе."));
      return;
    }

    console.log(`[ControllerAPI-WS] Подключение к WebSocket bridge: ${BRIDGE_WEBSOCKET_URL}`);
    toast({ title: "Мост", description: "Подключение к WebSocket мосту..." });
    websocket = new WebSocket(BRIDGE_WEBSOCKET_URL);

    websocket.onopen = () => {
      console.log('[ControllerAPI-WS] WebSocket подключение установлено.');
      toast({ title: "Мост", description: "WebSocket мост подключен." });
      reconnectAttempts = 0; // Сброс попыток переподключения
      resolve();
    };

    websocket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data as string) as WebSocketResponse;
        console.log('[ControllerAPI-WS] Получен ответ от моста:', response);
        if (response.messageId && ожидающиеЗапросы.has(response.messageId)) {
          const callback = ожидающиеЗапросы.get(response.messageId);
          callback?.(response);
          ожидающиеЗапросы.delete(response.messageId);
        } else {
          // Обработка сообщений без messageId (например, широковещательные обновления состояния)
          // TODO: Реализовать обработку таких сообщений, если мост их отправляет
          console.warn('[ControllerAPI-WS] Получено сообщение без messageId или для неизвестного запроса:', response);
          if (response.roomId && response.data && response.command === ControllerCommandType.GET_STATE) {
             // Это может быть спонтанное обновление состояния от моста
             // Нужно иметь механизм для обновления состояния комнаты в UI
             // Например, через кастомное событие или колбэк, зарегистрированный RoomPage
             const event = new CustomEvent('roomStateUpdate', { detail: { roomId: response.roomId, data: response.data } });
             window.dispatchEvent(event);
          }
        }
      } catch (error) {
        console.error('[ControllerAPI-WS] Ошибка парсинга JSON от моста:', error);
      }
    };

    websocket.onerror = (error) => {
      console.error('[ControllerAPI-WS] Ошибка WebSocket:', error);
      toast({ title: "Мост Ошибка", description: "Ошибка WebSocket соединения.", variant: "destructive" });
      // Не пытаемся переподключиться здесь, чтобы не создавать бесконечный цикл при недоступном сервере сразу
      // reject(error); // Это приведет к ошибке в sendCommandToController, если соединение не установлено
    };

    websocket.onclose = (event) => {
      console.log(`[ControllerAPI-WS] WebSocket соединение закрыто. Код: ${event.code}, Причина: ${event.reason}`);
      websocket = null; // Очищаем ссылку
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`[ControllerAPI-WS] Попытка переподключения #${reconnectAttempts} через ${RECONNECT_DELAY / 1000}с...`);
        setTimeout(connectWebSocketBridge, RECONNECT_DELAY);
      } else {
        console.error('[ControllerAPI-WS] Достигнут лимит попыток переподключения к WebSocket мосту.');
        toast({ title: "Мост Отключен", description: "Не удалось переподключиться к WebSocket мосту.", variant: "destructive" });
      }
      // Если соединение было закрыто, все ожидающие запросы должны быть отклонены
      ожидающиеЗапросы.forEach(callback => {
        callback({ success: false, error: "WebSocket соединение закрыто." });
      });
      ожидающиеЗапросы.clear();
      reject(new Error("WebSocket соединение закрыто."));
    };
  });
}

async function sendWebSocketMessage(message: WebSocketMessage): Promise<WebSocketResponse> {
  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
    try {
      await connectWebSocketBridge();
    } catch (error) {
      console.error('[ControllerAPI-WS] Не удалось установить WebSocket соединение перед отправкой.', error);
      return { success: false, error: (error as Error).message || "WebSocket не подключен." };
    }
  }
  // Убедимся еще раз после попытки подключения
  if (!websocket || websocket.readyState !== WebSocket.OPEN) {
     return { success: false, error: "WebSocket не подключен для отправки сообщения." };
  }


  return new Promise((resolve) => {
    const messageId = генерироватьMessageId();
    message.messageId = messageId;
    // TODO: Получать актуальный токен пользователя (если он нужен для команд мосту)
    // message.token = currentUserToken; 
    
    console.log('[ControllerAPI-WS] Отправка сообщения на мост:', message);
    websocket.send(JSON.stringify(message));
    ожидающиеЗапросы.set(messageId, resolve);

    // Тайм-аут для ответа
    setTimeout(() => {
      if (ожидающиеЗапросы.has(messageId)) {
        console.warn(`[ControllerAPI-WS] Тайм-аут для сообщения ${messageId}`);
        ожидающиеЗапросы.get(messageId)?.({ success: false, error: "Тайм-аут ответа от моста." });
        ожидающиеЗапросы.delete(messageId);
      }
    }, 10000); // 10 секунд тайм-аут
  });
}

// --- Web Bluetooth Communication ---

async function connectViaWebBluetooth(bleName: string): Promise<boolean> {
  if (isBleConnecting) {
    toast({ title: "BLE", description: "Подключение уже в процессе..." });
    return isBleAuthenticated;
  }
  if (bleCharacteristic && bleServer?.connected && isBleAuthenticated) {
    return true;
  }

  if (typeof navigator === 'undefined' || !navigator.bluetooth) {
    toast({ title: "BLE Ошибка", description: "Web Bluetooth не доступен.", variant: "destructive" });
    return false;
  }
  if (window.isSecureContext === false) {
    toast({ title: "BLE Ошибка", description: "Web Bluetooth требует HTTPS (кроме localhost).", variant: "destructive" });
    return false;
  }


  isBleConnecting = true;
  isBleAuthenticated = false;
  toast({ title: "BLE", description: `Попытка подключения к ${bleName}...` });

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: bleName }],
      optionalServices: [CONTROLLER_BLE_SERVICE_UUID],
    });

    if (!device.gatt) {
      toast({ title: "BLE Ошибка", description: "GATT сервер не найден.", variant: "destructive" });
      isBleConnecting = false;
      return false;
    }
    device.addEventListener('gattserverdisconnected', onBleDisconnected);
    bleServer = await device.gatt.connect();
    toast({ title: "BLE", description: "GATT сервер подключен." });
    const service = await bleServer.getPrimaryService(CONTROLLER_BLE_SERVICE_UUID);
    const characteristic = await service.getCharacteristic(CONTROLLER_BLE_CHARACTERISTIC_UUID);
    
    toast({ title: "BLE Аутентификация", description: "Отправка токена..." });
    const tokenData = textEncoder.encode(CONTROLLER_AUTH_TOKEN);
    await characteristic.writeValueWithoutResponse(tokenData); // Предполагаем, что токен просто пишется
    
    // Здесь можно добавить небольшую задержку или механизм ожидания подтверждения от контроллера, если он есть
    // await new Promise(resolve => setTimeout(resolve, 500)); 
    
    console.log('[ControllerAPI-BLE] Токен отправлен. Предполагается успешная аутентификация.');
    toast({ title: "BLE Аутентификация", description: "Аутентификация пройдена (предположительно)." });
    
    bleCharacteristic = characteristic;
    isBleAuthenticated = true;
    isBleConnecting = false;
    return true;
  } catch (error: any) {
    let userFriendlyMessage = `Ошибка BLE: ${error.message}`;
    if (error.name === 'NotFoundError') {
      userFriendlyMessage = "Поиск устройства BLE отменен или устройство не найдено. Убедитесь, что Bluetooth включен, устройство '${bleName}' находится в зоне досягаемости и выбрано. Попробуйте снова.";
    } else if (error.name === 'NotAllowedError') {
      userFriendlyMessage = "Доступ к Bluetooth запрещен. Разрешите использование Bluetooth в настройках браузера.";
    }
    toast({ title: "BLE Ошибка", description: userFriendlyMessage, variant: "destructive" });
    if (bleServer?.connected) bleServer.disconnect(); else onBleDisconnected(); // Сброс состояния
    isBleConnecting = false;
    return false;
  }
}

function onBleDisconnected() {
  console.log('[ControllerAPI-BLE] BLE устройство отключено.');
  toast({ title: "BLE Отключено", description: "Соединение с контроллером потеряно.", variant: "destructive" });
  bleCharacteristic = null;
  // bleServer = null; // gattserverdisconnected уже делает сервер недоступным
  isBleAuthenticated = false;
  isBleConnecting = false;
}

async function sendBleCommand(commandBytes: Uint8Array): Promise<boolean> {
  if (!bleCharacteristic || !bleServer?.connected || !isBleAuthenticated) {
    toast({ title: "BLE Ошибка", description: "Нет активного BLE соединения или аутентификации.", variant: "destructive" });
    return false;
  }
  try {
    await bleCharacteristic.writeValueWithoutResponse(commandBytes);
    console.log(`[ControllerAPI-BLE] Команда [${commandBytes.join(', ')}] успешно отправлена.`);
    return true;
  } catch (error: any) {
    toast({ title: "BLE Ошибка Команды", description: `Ошибка отправки BLE команды: ${error.message}`, variant: "destructive" });
    if (bleServer && !bleServer.connected) onBleDisconnected();
    return false;
  }
}

// --- Public API ---

export const sendCommandToController = async (
  roomId: string,
  commandType: ControllerCommandType,
  payload?: ControllerStateUpdate | any,
  preferredChannel: CommunicationChannel = CommunicationChannel.WEBSOCKET
): Promise<Partial<Room> | ControllerInfo | null> => {
  
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    toast({ title: "Оффлайн", description: "Нет подключения к сети. Команда не может быть отправлена.", variant: "destructive" });
    return null;
  }

  // Логика выбора канала (пока упрощенная)
  // В будущем можно добавить проверку доступности WebSocket перед попыткой.
  if (preferredChannel === CommunicationChannel.WEBSOCKET) {
    const wsMessage: WebSocketMessage = { roomId, command: commandType, payload };
    const wsResponse = await sendWebSocketMessage(wsMessage);

    if (wsResponse.success) {
      toast({ title: "Мост Команда", description: `Команда ${commandType} для ${roomId} успешно обработана мостом.` });
      return wsResponse.data || null;
    } else {
      toast({ title: "Мост Ошибка", description: `Ошибка команды ${commandType} для ${roomId}: ${wsResponse.error}`, variant: "destructive" });
      // Здесь можно добавить логику отката на BLE, если это необходимо
      // if (commandType === ControllerCommandType.SET_STATE && roomId === CONTROLLER_BLE_NAME) {
      //   console.warn("[ControllerAPI] WebSocket не удался, попытка через BLE для SET_STATE...");
      //   return sendCommandToController(roomId, commandType, payload, CommunicationChannel.BLUETOOTH);
      // }
      return null;
    }
  } else if (preferredChannel === CommunicationChannel.BLUETOOTH) {
    if (roomId !== CONTROLLER_BLE_NAME) {
      toast({ title: "BLE Ошибка", description: `BLE настроен только для ${CONTROLLER_BLE_NAME}.`, variant: "destructive" });
      return null;
    }
    if (!isBleAuthenticated) {
      const bleConnected = await connectViaWebBluetooth(CONTROLLER_BLE_NAME);
      if (!bleConnected) return null;
    }

    if (commandType === ControllerCommandType.SET_STATE && payload) {
      let dataToWrite: Uint8Array | null = null;
      if (payload.hasOwnProperty('lightsOn')) {
        dataToWrite = new Uint8Array([0x01, payload.lightsOn ? 0x01 : 0x00]);
      } else if (payload.hasOwnProperty('doorLocked')) {
        dataToWrite = new Uint8Array([0x02, payload.doorLocked ? 0x00 : 0x01]);
      }
      // TODO: Channel1, Channel2 commands
      if (dataToWrite) {
        const success = await sendBleCommand(dataToWrite);
        if (success) {
           toast({ title: "BLE Успех", description: `Команда ${Object.keys(payload).join('')} отправлена.` });
           return payload as Partial<Room>; // Оптимистичное обновление
        }
      }
      return null;
    } else if (commandType === ControllerCommandType.GET_INFO) {
      // Для BLE, GET_INFO может быть тем же, что и статические данные после подключения
      if (isBleAuthenticated) {
        return {
          macAddress: "A2:DD:6C:98:2E:58", // Эти данные должны быть получены от контроллера, если возможно
          ipAddress: "N/A (BLE)",
          bleName: CONTROLLER_BLE_NAME,
          token: CONTROLLER_AUTH_TOKEN,
        } as ControllerInfo;
      }
    } else if (commandType === ControllerCommandType.GET_STATE) {
      toast({ title: "BLE", description: "Чтение состояния датчиков через BLE не реализовано." });
      // TODO: Реализовать чтение состояния с bleCharacteristic
    }
    return null;
  }
  
  toast({ title: "Ошибка", description: "Неизвестный или неподдерживаемый канал связи.", variant: "destructive" });
  return null;
};

export const turnOffAllLightsAdmin = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    toast({ title: "Оффлайн", description: "Нет подключения к сети.", variant: "destructive" });
    return false;
  }
  const wsMessage: WebSocketMessage = { command: ControllerCommandType.ADMIN_TURN_OFF_ALL_LIGHTS };
  const wsResponse = await sendWebSocketMessage(wsMessage);
  if (wsResponse.success) {
    toast({ title: "Админ Команда", description: "Команда 'Выключить весь свет' отправлена на мост." });
    return true;
  } else {
    toast({ title: "Админ Ошибка", description: `Ошибка команды 'Выключить весь свет': ${wsResponse.error}`, variant: "destructive" });
    return false;
  }
};


export const disconnectFromBLE = async () => {
  if (bleServer?.connected) {
    try {
      bleServer.disconnect(); // onBleDisconnected вызовется по событию
      toast({title: "BLE", description: "Отключено от устройства."});
    } catch (error: any) {
      toast({title: "BLE Ошибка", description: "Ошибка при отключении.", variant: "destructive"});
      onBleDisconnected(); // Принудительно сбрасываем состояние
    }
  } else {
    onBleDisconnected(); // Сброс, если не было активного соединения
  }
};

// Попытка подключиться к WebSocket при загрузке модуля (опционально)
// connectWebSocketBridge().catch(err => console.warn("Не удалось автоматически подключиться к WebSocket мосту при запуске:", err));
// Или можно вызывать connectWebSocketBridge() при первом вызове sendCommandToController, если websocket неактивен.

// Эта функция может быть вызвана из UI для явного подключения к BLE
export const ensureBleConnection = async (): Promise<boolean> => {
  if (isBleAuthenticated && bleServer?.connected) return true;
  return connectViaWebBluetooth(CONTROLLER_BLE_NAME);
};
