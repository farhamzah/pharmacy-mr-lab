export class HapticsManager {
  pulse(intensity = 0.25, duration = 45): void {
    try {
      const gamepads = navigator.getGamepads?.() ?? [];
      gamepads.forEach((gamepad) => {
        const actuator = gamepad?.hapticActuators?.[0];
        void actuator?.pulse?.(Math.min(1, intensity), duration);
      });
    } catch {
      // Haptics are optional and often unavailable on desktop.
    }
  }
}
