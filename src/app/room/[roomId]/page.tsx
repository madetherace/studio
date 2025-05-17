
"use client";
import AuthGuard from '@/components/auth/AuthGuard';
import { RoomControls } from '@/components/guest/RoomControls';
import { SensorDisplay } from '@/components/guest/SensorDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMockRooms, updateMockRoom, initializeMockRooms } from '@/lib/mock-data';
import type { Room, ControllerInfo, WebSocketResponse } from '@/types';
import { ControllerCommandType, CommunicationChannel } from '@/types';
import { sendCommandToController, ensureBleConnection, disconnectFromBLE } from '@/services/controllerApi';
import { BedDouble, WifiOff, Info, Network, Bluetooth, Fingerprint, KeyRound, Loader2, Power, Zap } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function RoomManagementPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const { toast } = useToast();

  const [controllerInfo, setControllerInfo] = useState<ControllerInfo | null>(null);
  const [loadingControllerInfo, setLoadingControllerInfo] = useState(false);
  const [preferredChannel, setPreferredChannel] = useState<CommunicationChannel>(CommunicationChannel.WEBSOCKET);

  useEffect(() => {
    initializeMockRooms(); // Ensure rooms are initialized
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      // disconnectFromBLE(); // Отключаемся от BLE при размонтировании страницы
    };
  }, []);

  const fetchRoomDataFromLocalStorage = useCallback(() => {
    const allRooms = getMockRooms();
    const currentRoom = allRooms.find(r => r.id === roomId);
    if (currentRoom) {
      setRoom(currentRoom);
    } else {
      toast({ title: "Ошибка", description: "Комната не найдена.", variant: "destructive" });
    }
  }, [roomId, toast]);

  useEffect(() => {
    if (roomId) {
      setLoading(true);
      fetchRoomDataFromLocalStorage(); // Начальная загрузка из localStorage
      setLoading(false);
    }
  }, [roomId, fetchRoomDataFromLocalStorage]);

  // Обработчик обновлений состояния комнаты от WebSocket
  useEffect(() => {
    const handleRoomStateUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<WebSocketResponse>;
      if (customEvent.detail.roomId === roomId && customEvent.detail.success && customEvent.detail.data) {
        const updatedRoomData = customEvent.detail.data as Partial<Room>;
        console.log(`[RoomPage] WebSocket обновление для ${roomId}:`, updatedRoomData);
        setRoom(prevRoom => {
          if (prevRoom) {
            const newRoomState = { ...prevRoom, ...updatedRoomData };
            updateMockRoom(newRoomState); // Обновляем и в localStorage для консистентности
            return newRoomState;
          }
          return null;
        });
        toast({ title: "Обновление", description: `Состояние комнаты ${roomId} обновлено через мост.` });
      }
    };
    window.addEventListener('roomStateUpdate', handleRoomStateUpdate);
    return () => {
      window.removeEventListener('roomStateUpdate', handleRoomStateUpdate);
    };
  }, [roomId, toast]);


  const handleRoomStateChange = async (updatedState: Partial<Room>) => {
    if (!room) return;
    if (isOffline && preferredChannel === CommunicationChannel.WEBSOCKET) {
      toast({ title: "Оффлайн", description: "Нет подключения к сети для отправки команды через мост.", variant: "destructive" });
      return;
    }

    // Оптимистичное обновление UI
    const newRoomState = { ...room, ...updatedState };
    setRoom(newRoomState);
    updateMockRoom(newRoomState); // Также обновляем в mock-data/localStorage

    const result = await sendCommandToController(room.id, ControllerCommandType.SET_STATE, updatedState, preferredChannel);
    
    if (result) {
      // Если команда успешна, UI уже обновлен оптимистично.
      // Если мост/контроллер возвращает подтвержденное состояние, можно его здесь применить,
      // но обычно для SET_STATE достаточно оптимистичного обновления.
      toast({ title: "Комната Обновлена", description: `Настройки комнаты ${room.id} отправлены (${preferredChannel}).` });
    } else {
      // Если команда не удалась, откатываем UI к предыдущему состоянию
      toast({ title: "Ошибка Команды", description: `Не удалось обновить настройки комнаты ${room.id} (${preferredChannel}).`, variant: "destructive" });
      fetchRoomDataFromLocalStorage(); // Восстанавливаем из localStorage
    }
  };
  
  // Периодическое получение состояния датчиков
  useEffect(() => {
    if (!room || isOffline && preferredChannel === CommunicationChannel.WEBSOCKET) return;

    const fetchSensorData = async () => {
      console.log(`[RoomPage] Запрос GET_STATE для ${room.id} через ${preferredChannel}`);
      const result = await sendCommandToController(room.id, ControllerCommandType.GET_STATE, undefined, preferredChannel);
      if (result && 'temperature' in result) { // Проверяем, что это данные комнаты
        const updatedSensorData = result as Partial<Room>;
        setRoom(prevRoom => {
          if (prevRoom) {
            const newRoomState = { ...prevRoom, ...updatedSensorData };
            updateMockRoom(newRoomState);
            return newRoomState;
          }
          return null;
        });
         // toast({ title: "Датчики Обновлены", description: `Данные сенсоров для ${room.id} обновлены.` });
      } else if (result === null && preferredChannel === CommunicationChannel.WEBSOCKET && !isOffline) {
        // Ошибка при получении данных через WebSocket, но не из-за оффлайна
        // toast({ title: "Ошибка Датчиков", description: `Не удалось получить данные сенсоров для ${room.id}.`, variant: "destructive" });
      }
    };

    // Немедленный вызов при монтировании или изменении комнаты/канала
    fetchSensorData(); 

    const intervalId = setInterval(fetchSensorData, 10000); // Каждые 10 секунд
    return () => clearInterval(intervalId);
  }, [room, isOffline, preferredChannel, toast]);


  const fetchControllerInfo = async () => {
    if (!room) {
      toast({ title: "Ошибка", description: "Комната не выбрана.", variant: "destructive" });
      return;
    }
    if (isOffline && preferredChannel === CommunicationChannel.WEBSOCKET) {
      toast({ title: "Оффлайн", description: "Нет сети для запроса информации через мост.", variant: "destructive" });
      return;
    }
    setLoadingControllerInfo(true);
    const info = await sendCommandToController(room.id, ControllerCommandType.GET_INFO, undefined, preferredChannel);
    if (info && 'macAddress' in info) {
      setControllerInfo(info as ControllerInfo);
      toast({ title: "Информация о Контроллере", description: `Успешно получена (${preferredChannel}).` });
    } else {
      toast({ title: "Ошибка", description: `Не удалось получить информацию о контроллере (${preferredChannel}).`, variant: "destructive" });
      setControllerInfo(null);
    }
    setLoadingControllerInfo(false);
  };
  
  const handleConnectBLE = async () => {
    if (roomId === CONTROLLER_BLE_NAME) { // Предполагаем, что CONTROLLER_BLE_NAME экспортируется или известен
      const success = await ensureBleConnection();
      if (success) {
        toast({ title: "BLE", description: "Успешно подключено к BLE контроллеру." });
        setPreferredChannel(CommunicationChannel.BLUETOOTH); // Переключаемся на BLE
      } else {
        toast({ title: "BLE Ошибка", description: "Не удалось подключиться к BLE контроллеру.", variant: "destructive" });
      }
    } else {
       toast({ title: "BLE Ошибка", description: `BLE доступно только для комнаты ${CONTROLLER_BLE_NAME}.`, variant: "destructive" });
    }
  };
  
  const handleDisconnectBLE = async () => {
    await disconnectFromBLE();
    setPreferredChannel(CommunicationChannel.WEBSOCKET); // Возвращаемся на WebSocket по умолчанию
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-[200px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2">Загрузка данных о комнате...</p></div>;
  }

  if (!room) {
    return <div className="text-center py-10 text-destructive">Комната {roomId} не найдена.</div>;
  }
  
  let aiHint = "hotel room interior";
  if (room.id === "ROOM_19") aiHint = "modern hotel room";
  else if (room.amenities?.includes("King Bed")) aiHint = "luxury hotel suite";
  else if (room.capacity === 1) aiHint = "cozy single room";


  return (
    <AuthGuard allowedRoles={['guest']}>
      <div className="space-y-6">
        {isOffline && (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="p-3 text-center text-sm text-destructive-foreground flex items-center justify-center gap-2">
              <WifiOff className="h-4 w-4" /> Вы оффлайн. Некоторые функции могут быть недоступны или работать с задержкой.
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2">
                    <BedDouble className="h-6 w-6 text-accent" />
                    Управление комнатой: {room.id}
                    </CardTitle>
                    <CardDescription>Гость: {room.guestName || 'N/A'}. Канал: {preferredChannel === CommunicationChannel.BLUETOOTH ? 'Bluetooth' : 'WebSocket Мост'}</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    {roomId === 'ROOM_19' && preferredChannel === CommunicationChannel.WEBSOCKET && navigator.bluetooth && (
                         <Button onClick={handleConnectBLE} variant="outline" size="sm">
                            <Bluetooth className="mr-2 h-4 w-4" /> Подкл. BLE
                        </Button>
                    )}
                    {preferredChannel === CommunicationChannel.BLUETOOTH && (
                         <Button onClick={handleDisconnectBLE} variant="outline" size="sm">
                            <Power className="mr-2 h-4 w-4" /> Откл. BLE
                        </Button>
                    )}
                </div>
            </div>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
              {room.imageUrl && (
                <Image
                  data-ai-hint={aiHint}
                  src={room.imageUrl}
                  alt={`Изображение комнаты ${room.id}`}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover aspect-video shadow-md"
                  priority
                />
              )}
               <SensorDisplay room={room} />
            </div>
            <div className="md:col-span-2">
                <RoomControls room={room} onStateChange={handleRoomStateChange} isOffline={isOffline && preferredChannel === CommunicationChannel.WEBSOCKET} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-accent" />
              Информация о Контроллере
            </CardTitle>
            <CardDescription>Детали об управляющем блоке комнаты. {room.id === "ROOM_19" ? "(Это контроллер ROOM_19)" : ""}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={fetchControllerInfo} disabled={loadingControllerInfo || (isOffline && preferredChannel === CommunicationChannel.WEBSOCKET)}>
              {loadingControllerInfo ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" /> 
              )}
              {loadingControllerInfo ? 'Запрос...' : 'Запросить инфо о контроллере'}
            </Button>
            {controllerInfo && (
              <ul className="mt-4 space-y-2 text-sm p-4 border rounded-md bg-muted/50">
                <li className="flex items-center">
                  <Network className="h-4 w-4 mr-2 text-muted-foreground" />
                  <strong>IP Адрес:</strong><span className="ml-1">{controllerInfo.ipAddress}</span>
                </li>
                <li className="flex items-center">
                  <Fingerprint className="h-4 w-4 mr-2 text-muted-foreground" />
                  <strong>MAC Адрес:</strong><span className="ml-1">{controllerInfo.macAddress}</span>
                </li>
                <li className="flex items-center">
                  <Bluetooth className="h-4 w-4 mr-2 text-muted-foreground" />
                  <strong>BLE Имя:</strong><span className="ml-1">{controllerInfo.bleName}</span>
                </li>
                <li className="flex items-center">
                  <KeyRound className="h-4 w-4 mr-2 text-muted-foreground" />
                  <strong>Токен Контроллера:</strong><span className="ml-1 break-all">{controllerInfo.token}</span>
                </li>
              </ul>
            )}
          </CardContent>
        </Card>

      </div>
    </AuthGuard>
  );
}
// Константа CONTROLLER_BLE_NAME должна быть доступна здесь, если она не экспортируется из controllerApi.ts
// или определена глобально. Для примера, если она есть в controllerApi:
// import { CONTROLLER_BLE_NAME } from '@/services/controllerApi'; // Если экспортируется
const CONTROLLER_BLE_NAME = 'ROOM_19'; // Или определить локально/глобально
