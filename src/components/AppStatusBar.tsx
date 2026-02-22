import { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryFull, BatteryMedium, BatteryLow, BatteryWarning, BatteryCharging } from 'lucide-react';

// ── Types for Web APIs ────────────────────────────────────────────
interface BatteryManager extends EventTarget {
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
}

interface NetworkInformation {
    type?: string; // 'wifi' | 'cellular' | 'ethernet' | 'none' | 'unknown'
    effectiveType?: string; // '4g' | '3g' | '2g' | 'slow-2g'
    downlink?: number;
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

declare global {
    interface Navigator {
        getBattery?: () => Promise<BatteryManager>;
        connection?: NetworkInformation;
        mozConnection?: NetworkInformation;
        webkitConnection?: NetworkInformation;
    }
}

// ── Battery icon helper ───────────────────────────────────────────
const BatteryIcon = ({ level, charging }: { level: number; charging: boolean }) => {
    if (charging) return <BatteryCharging className="h-[14px] w-[14px] text-[#30D158]" strokeWidth={2} />;
    if (level > 0.7) return <BatteryFull className="h-[14px] w-[14px] text-white" strokeWidth={2} />;
    if (level > 0.4) return <BatteryMedium className="h-[14px] w-[14px] text-[#FFD60A]" strokeWidth={2} />;
    if (level > 0.2) return <BatteryLow className="h-[14px] w-[14px] text-[#FF9F0A]" strokeWidth={2} />;
    return <BatteryWarning className="h-[14px] w-[14px] text-[#FF453A]" strokeWidth={2} />;
};

// ── Network icon helper ───────────────────────────────────────────
const NetworkIcon = ({ type, effectiveType }: { type?: string; effectiveType?: string }) => {
    if (type === 'wifi') {
        return <Wifi className="h-[14px] w-[14px] text-white" strokeWidth={2} />;
    }
    if (type === 'cellular' || type === 'wimax') {
        const label = effectiveType === '4g' ? '4G' : effectiveType === '3g' ? '3G' : '2G';
        return (
            <span className="text-[10px] font-bold text-white tracking-tight leading-none">{label}</span>
        );
    }
    return <Signal className="h-[14px] w-[14px] text-white/50" strokeWidth={2} />;
};

// ── Component ─────────────────────────────────────────────────────
const AppStatusBar = () => {
    const [time, setTime] = useState('');
    const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
    const [network, setNetwork] = useState<{ type?: string; effectiveType?: string } | null>(null);

    // Live clock
    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        };
        update();
        const id = setInterval(update, 10_000);
        return () => clearInterval(id);
    }, []);

    // Battery API
    useEffect(() => {
        if (!navigator.getBattery) return;
        let bm: BatteryManager | null = null;

        const onBatteryChange = () => {
            if (bm) setBattery({ level: bm.level, charging: bm.charging });
        };

        navigator.getBattery().then((bat) => {
            bm = bat;
            setBattery({ level: bat.level, charging: bat.charging });
            bat.addEventListener('levelchange', onBatteryChange);
            bat.addEventListener('chargingchange', onBatteryChange);
        }).catch(() => {/* not supported */ });

        return () => {
            if (bm) {
                bm.removeEventListener('levelchange', onBatteryChange);
                bm.removeEventListener('chargingchange', onBatteryChange);
            }
        };
    }, []);

    // Network Information API
    useEffect(() => {
        const conn: NetworkInformation | undefined =
            navigator.connection ?? navigator.mozConnection ?? navigator.webkitConnection;

        if (!conn) return;

        const update = () => {
            setNetwork({ type: conn.type, effectiveType: conn.effectiveType });
        };
        update();
        conn.addEventListener('change', update);
        return () => conn.removeEventListener('change', update);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[99] flex items-center justify-between px-5 h-12 pointer-events-none select-none">
            {/* Time */}
            <span className="text-[15px] font-semibold text-white tracking-tight">{time}</span>

            {/* Right — real device data with fallback icons */}
            <div className="flex items-center gap-2">
                {/* Network */}
                {network
                    ? <NetworkIcon type={network.type} effectiveType={network.effectiveType} />
                    : <Signal className="h-[14px] w-[14px] text-white" strokeWidth={2} />
                }

                {/* Battery */}
                {battery ? (
                    <div className="flex items-center gap-1">
                        <BatteryIcon level={battery.level} charging={battery.charging} />
                        <span className="text-[11px] font-semibold text-white/70">
                            {Math.round(battery.level * 100)}%
                        </span>
                    </div>
                ) : (
                    <BatteryFull className="h-[14px] w-[14px] text-white" strokeWidth={2} />
                )}
            </div>
        </div>
    );
};

export default AppStatusBar;
