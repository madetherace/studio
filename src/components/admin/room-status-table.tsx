
"use client";
// This component is effectively replaced by AdminRoomTable.tsx for the new PWA.
// Keeping for reference, but AdminRoomTable.tsx should be used.

import type { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OldRoomStatusTableProps {
  rooms: Room[];
  onToggleLights: (roomId: string) => void;
  onTogglePower: (roomId: string) => void; // Power might not be a direct toggle in new model
}

export function RoomStatusTable({ rooms, onToggleLights, onTogglePower }: OldRoomStatusTableProps) {
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: Room['status']) => {
    switch (status) {
      case 'available': return 'default'; 
      case 'occupied': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Old Room Status Overview</CardTitle>
        <CardDescription>Monitor and manage all hotel rooms in real-time.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room No.</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lights</TableHead>
              <TableHead>Power (Concept)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{room.id}</TableCell>
                <TableCell>{room.guestName || 'N/A'}</TableCell>
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
                   {/* Power on/off for whole room is less common; specific device controls are preferred */}
                  <Badge variant={'outline'}> 
                    N/A
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      onToggleLights(room.id);
                      toast({ title: `Lights ${room.lightsOn ? 'Off' : 'On'}`, description: `Toggled lights for room ${room.id}`});
                    }}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Lightbulb className="mr-1 h-4 w-4" /> {room.lightsOn ? 'Turn Off' : 'Turn On'}
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

