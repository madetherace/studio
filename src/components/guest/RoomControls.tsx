
"use client";

import type { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, DoorOpen, Lock, Zap, Tv2, Sun } from 'lucide-react'; // Using Tv2 for channel1, Sun for channel2 as generic icons
import { useToast } from '@/hooks/use-toast';

interface RoomControlsProps {
  room: Room;
  onStateChange: (updatedState: Partial<Room>) => void;
  isOffline: boolean;
}

export function RoomControls({ room, onStateChange, isOffline }: RoomControlsProps) {
  const { toast } = useToast();

  const handleToggle = (property: keyof Pick<Room, 'lightsOn' | 'doorLocked' | 'channel1On' | 'channel2On'>, value?: boolean) => {
    if (isOffline) {
      toast({ title: "Offline", description: "Controls are disabled.", variant: "destructive" });
      return;
    }
    const newValue = typeof value === 'boolean' ? value : !room[property];
    onStateChange({ [property]: newValue });
  };
  
  const handleDoorOpen = () => {
    if (isOffline) {
      toast({ title: "Offline", description: "Door control is disabled.", variant: "destructive" });
      return;
    }
    // Simulate temporary unlock - for demo, we'll just toggle doorLocked to false
    onStateChange({ doorLocked: false }); 
    toast({ title: "Door Control", description: "Door unlocked (simulated)." });
    // In a real scenario, this might set doorLocked to false for a period, then true.
    // Or it's a momentary action that doesn't change the persistent `doorLocked` state.
    // For simplicity, this demo action changes state.
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Controls</CardTitle>
        <CardDescription>Manage your room's features.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-md">
          <Label htmlFor="lights-switch" className="flex items-center gap-2">
            <Lightbulb className={room.lightsOn ? "text-yellow-400" : "text-muted-foreground"} />
            Lights
          </Label>
          <Switch
            id="lights-switch"
            checked={room.lightsOn}
            onCheckedChange={() => handleToggle('lightsOn')}
            disabled={isOffline}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-md">
          <Label htmlFor="door-button" className="flex items-center gap-2">
            {room.doorLocked ? <Lock className="text-red-500" /> : <DoorOpen className="text-green-500" />}
            Door Lock
          </Label>
          <div className="flex gap-2">
            <Button onClick={handleDoorOpen} variant="outline" size="sm" disabled={isOffline || !room.doorLocked}>
              Open Door
            </Button>
             <Button 
                onClick={() => handleToggle('doorLocked', true)} 
                variant={room.doorLocked ? "default": "outline"} 
                size="sm" disabled={isOffline || room.doorLocked}
             >
                Lock Door
             </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 border rounded-md">
          <Label htmlFor="channel1-switch" className="flex items-center gap-2">
            <Tv2 className={room.channel1On ? "text-sky-500" : "text-muted-foreground"} />
            Channel 1 (e.g., TV)
          </Label>
          <Switch
            id="channel1-switch"
            checked={room.channel1On}
            onCheckedChange={() => handleToggle('channel1On')}
            disabled={isOffline}
          />
        </div>

        <div className="flex items-center justify-between p-3 border rounded-md">
          <Label htmlFor="channel2-switch" className="flex items-center gap-2">
            <Sun className={room.channel2On ? "text-orange-500" : "text-muted-foreground"} />
            Channel 2 (e.g., Mood Light)
          </Label>
          <Switch
            id="channel2-switch"
            checked={room.channel2On}
            onCheckedChange={() => handleToggle('channel2On')}
            disabled={isOffline}
          />
        </div>
      </CardContent>
    </Card>
  );
}
