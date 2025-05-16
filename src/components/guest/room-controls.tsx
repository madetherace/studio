
"use client";

import type { Room } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DoorOpen, Lightbulb, Zap, WifiOff } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface RoomControlsProps {
  roomId: string;
  initialLightsOn: boolean;
  initialPowerOn: boolean;
  isOffline: boolean;
  onControlChange: (roomId: string, controlType: 'lights' | 'power', value: boolean) => void;
}

export function RoomControls({ roomId, initialLightsOn, initialPowerOn, isOffline, onControlChange }: RoomControlsProps) {
  const [lightsOn, setLightsOn] = useState(initialLightsOn);
  const [powerOn, setPowerOn] = useState(initialPowerOn);
  const { toast } = useToast();

  useEffect(() => {
    setLightsOn(initialLightsOn);
    setPowerOn(initialPowerOn);
  }, [initialLightsOn, initialPowerOn]);


  const handleDoorAccess = () => {
    if (isOffline) {
      toast({
        title: "Offline Mode",
        description: "Door control requires an internet connection.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Door Access",
      description: "Simulating door unlock signal... Door is now unlocked for 2 minutes.",
    });
  };

  const handleLightsToggle = (checked: boolean) => {
    if (isOffline) {
      toast({
        title: "Offline Mode",
        description: "Light control requires an internet connection.",
        variant: "destructive"
      });
      // Revert UI change if offline fails immediately
      // For a better UX, you might allow optimistic update and sync later.
      // For this simulation, we prevent change.
      return; 
    }
    setLightsOn(checked);
    onControlChange(roomId, 'lights', checked);
    toast({
      title: "Lights Control",
      description: `Lights turned ${checked ? 'ON' : 'OFF'}.`,
    });
  };
  
  // Power toggle is not usually a guest feature, but included for "smart-room" demo
  // Typically this would be an admin feature or an eco-mode setting.
  // For this demo, we'll make it a guest control.
   const handlePowerToggle = (checked: boolean) => {
    if (isOffline) {
      toast({
        title: "Offline Mode",
        description: "Power control requires an internet connection.",
        variant: "destructive"
      });
      return;
    }
    setPowerOn(checked);
    onControlChange(roomId, 'power', checked);
    toast({
      title: "Main Power Control",
      description: `Room power turned ${checked ? 'ON' : 'OFF'}. This might affect other appliances.`,
    });
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center gap-2">
            <Zap className="h-5 w-5"/> Smart Room Controls
        </CardTitle>
        {isOffline && (
            <CardDescription className="text-destructive flex items-center gap-1">
                <WifiOff className="h-4 w-4" /> Some controls are disabled while offline.
            </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-background hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <DoorOpen className={`h-6 w-6 ${isOffline ? 'text-muted' : 'text-accent'}`} />
            <Label htmlFor="door-access" className="text-lg font-medium">Door Access</Label>
          </div>
          <Button onClick={handleDoorAccess} variant="outline" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isOffline}>
            Unlock Door
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-background hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <Lightbulb className={`h-6 w-6 ${isOffline || !powerOn ? 'text-muted' : (lightsOn ? 'text-yellow-400' : 'text-foreground')}`} />
            <Label htmlFor="lights-switch" className="text-lg font-medium">Room Lighting</Label>
          </div>
          <Switch 
            id="lights-switch" 
            checked={lightsOn} 
            onCheckedChange={handleLightsToggle}
            disabled={isOffline || !powerOn} 
            aria-label="Toggle room lighting"
          />
        </div>
        
        <div className="flex items-center justify-between p-4 border rounded-lg bg-background hover:bg-secondary/30 transition-colors">
          <div className="flex items-center gap-3">
            <Zap className={`h-6 w-6 ${isOffline ? 'text-muted' : (powerOn ? 'text-green-500' : 'text-foreground')}`} />
            <Label htmlFor="power-switch" className="text-lg font-medium">Main Power</Label>
          </div>
          <Switch 
            id="power-switch" 
            checked={powerOn} 
            onCheckedChange={handlePowerToggle} 
            disabled={isOffline}
            aria-label="Toggle main room power"
          />
        </div>
        {!powerOn && !isOffline && <p className="text-sm text-destructive text-center">Main power is OFF. Lighting and other appliances may not work.</p>}

      </CardContent>
    </Card>
  );
}

