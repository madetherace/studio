
"use client";
import AuthGuard from '@/components/auth/AuthGuard';
import { AdminRoomTable } from '@/components/admin/AdminRoomTable';
import { OccupancyChart } from '@/components/admin/OccupancyChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMockRooms, updateMockRoom, initializeMockRooms } from '@/lib/mock-data';
import type { Room } from '@/types';
import { LightbulbOff, BarChartHorizontalBig, RefreshCw, ZapOff } from 'lucide-react'; // Added ZapOff
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { turnOffAllLightsAdmin } from '@/services/controllerApi'; // Import the new function

export default function AdminDashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeMockRooms(); // Ensure rooms are initialized
    setRooms(getMockRooms());
    setLoading(false);
  }, []);

  const handleMasterTurnOffLights = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      toast({ title: "Оффлайн", description: "Нет подключения к сети для отправки команды.", variant: "destructive" });
      return;
    }
    const success = await turnOffAllLightsAdmin();
    if (success) {
      // Оптимистичное обновление UI или ожидание ответа от моста, если он меняет состояние комнат
      // Для простоты, предположим, мост сам обновит комнаты или это не требуется немедленно в UI
      // В реальном приложении здесь может быть логика обновления состояния комнат после подтверждения от моста
      // setRooms(currentRooms => currentRooms.map(r => ({ ...r, lightsOn: false })));
      // mockRoomsData.forEach(r => updateMockRoom({...r, lightsOn: false}));
      // refreshRoomData(); // Это перезагрузит данные из localStorage, которые могут не отражать команду мосту
      toast({ title: "Команда Отправлена", description: "Команда на отключение всего света отправлена на мост." });
    } else {
      toast({ title: "Ошибка Команды", description: "Не удалось отправить команду на отключение света.", variant: "destructive" });
    }
  };

  const refreshRoomData = () => {
    setLoading(true);
    setRooms(getMockRooms()); // Re-fetch from the source (localStorage)
    setLoading(false);
    toast({title: "Данные Обновлены", description: "Данные о комнатах обновлены из локального хранилища."});
  }

  if (loading) {
    return <div className="text-center py-10">Загрузка панели администратора...</div>;
  }

  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Панель Администратора</h1>
          <div className="flex gap-2">
            <Button onClick={handleMasterTurnOffLights} variant="destructive">
              <ZapOff className="mr-2 h-4 w-4" /> Выключить весь свет
            </Button>
            {/* Старая кнопка, если нужна для локального управления мок-данными
            <Button onClick={handleTurnOffAllLightsLocal} variant="destructive">
              <LightbulbOff className="mr-2 h-4 w-4" /> Turn Off All Lights (Local Mock)
            </Button>
            */}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartHorizontalBig className="h-5 w-5 text-accent" />
              Обзор Занятости
            </CardTitle>
            <CardDescription>Визуализация занятости номеров отеля.</CardDescription>
          </CardHeader>
          <CardContent>
            <OccupancyChart rooms={rooms} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Состояние и Управление Номерами</CardTitle>
            <CardDescription>Мониторинг и управление всеми номерами отеля.</CardDescription>
             <Button onClick={refreshRoomData} variant="outline" size="sm" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Обновить данные
             </Button>
          </CardHeader>
          <CardContent>
            <AdminRoomTable rooms={rooms} onRoomUpdate={(updatedRoom) => {
              updateMockRoom(updatedRoom); // Обновляем в localStorage (для локальных изменений)
              setRooms(prevRooms => prevRooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
              // Отправка команды на мост для реального изменения состояния
              // sendCommandToController(updatedRoom.id, ControllerCommandType.SET_STATE, updatedRoom);
            }} />
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
