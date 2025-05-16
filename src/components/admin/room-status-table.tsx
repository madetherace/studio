
"use client";

import type { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoomStatusTableProps {
  rooms: Room[];
  onToggleLights: (roomId: string) => void;
  onTogglePower: (roomId: string) => void;
}

export function RoomStatusTable({ rooms, onToggleLights, onTogglePower }: RoomStatusTableProps) {
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: Room['status']) => {
    switch (status) {
      case 'available': return 'default'; // default is primary, which is fine
      case 'occupied': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Room Status Overview</CardTitle>
        <CardDescription>Monitor and manage all hotel rooms in real-time.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lights</TableHead>
              <TableHead>Power</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{room.id.split('-')[1] || room.id}</TableCell>
                <TableCell>{room.name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(room.status)} className="capitalize">
                    {room.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={room.lightsOn ? 'default' : 'outline'} className={room.lightsOn ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {room.lightsOn ? 'On' : 'Off'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={room.powerOn ? 'default' : 'outline'} className={room.powerOn ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {room.powerOn ? 'On' : 'Off'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      onToggleLights(room.id);
                      toast({ title: `Lights ${room.lightsOn ? 'Off' : 'On'}`, description: `Toggled lights for room ${room.name}`});
                    }}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Lightbulb className="mr-1 h-4 w-4" /> {room.lightsOn ? 'Turn Off' : 'Turn On'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      onTogglePower(room.id);
                      toast({ title: `Power ${room.powerOn ? 'Off' : 'On'}`, description: `Toggled power for room ${room.name}`});
                    }}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Zap className="mr-1 h-4 w-4" /> {room.powerOn ? 'Shutdown' : 'Power On'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rooms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
                <p>No room data available.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
