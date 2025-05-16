
"use client";

import type { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Lightbulb, Lock, Tv2, Sun } from 'lucide-react'; // Using Tv2 and Sun for channels
import { useToast } from '@/hooks/use-toast';

interface AdminRoomTableProps {
  rooms: Room[];
  onRoomUpdate: (updatedRoom: Room) => void; // For real-time updates back to parent
}

export function AdminRoomTable({ rooms, onRoomUpdate }: AdminRoomTableProps) {
  const { toast } = useToast();

  const handleToggle = (roomId: string, property: keyof Pick<Room, 'lightsOn' | 'doorLocked' | 'channel1On' | 'channel2On'>) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      const updatedRoom = { ...room, [property]: !room[property] };
      onRoomUpdate(updatedRoom); // Propagate update
      // In a real app, call controllerApi.sendCommand here
      toast({ title: "Room Updated", description: `Room ${roomId} ${property} toggled.` });
    }
  };

  const getStatusVariant = (status: Room['status']): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'occupied') return 'secondary';
    if (status === 'maintenance') return 'destructive';
    if (status === 'available') return 'default'; // using primary for available
    return 'outline';
  }


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Room</TableHead>
          <TableHead>Guest</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Lights</TableHead>
          <TableHead>Lock</TableHead>
          <TableHead>Channel 1</TableHead>
          <TableHead>Channel 2</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow key={room.id}>
            <TableCell className="font-medium">{room.id}</TableCell>
            <TableCell>{room.guestName || 'N/A'}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(room.status)} className="capitalize">
                {room.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={room.lightsOn ? 'default' : 'outline'} className={room.lightsOn ? 'bg-green-500' : ''}>
                {room.lightsOn ? 'On' : 'Off'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={!room.doorLocked ? 'default' : 'outline'} className={!room.doorLocked ? 'bg-green-500' : 'bg-red-500 text-destructive-foreground'}>
                {!room.doorLocked ? 'Open' : 'Locked'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={room.channel1On ? 'default' : 'outline'} className={room.channel1On ? 'bg-blue-500' : ''}>
                {room.channel1On ? 'On' : 'Off'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={room.channel2On ? 'default' : 'outline'} className={room.channel2On ? 'bg-orange-500' : ''}>
                {room.channel2On ? 'On' : 'Off'}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button variant="ghost" size="icon" onClick={() => handleToggle(room.id, 'lightsOn')} title="Toggle Lights">
                <Lightbulb className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleToggle(room.id, 'doorLocked')} title="Toggle Lock">
                <Lock className="h-4 w-4" />
              </Button>
              {/* Add more specific controls if needed, or a "details" button */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
