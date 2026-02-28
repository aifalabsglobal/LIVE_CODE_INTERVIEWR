"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useBehaviorMonitor(maxWarnings: number = 3) {
    const [warnings, setWarnings] = useState(0);
    const [showWarningOverlay, setShowWarningOverlay] = useState(false);
    const [isTerminated, setIsTerminated] = useState(false);

    useEffect(() => {
        const handleViolation = (reason: string) => {
            setWarnings((prev) => {
                const next = prev + 1;

                setTimeout(() => {
                    if (next > maxWarnings) {
                        setIsTerminated(true);
                    } else {
                        setShowWarningOverlay(true);
                        toast.error(`Warning ${next}/${maxWarnings}: ${reason}`);
                    }
                }, 0);

                return next;
            });
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                handleViolation("Please do not switch tabs or minimize the window during the interview.");
            }
        };

        const handleWindowBlur = () => {
            handleViolation("Window lost focus. Please keep the interview window active.");
        };

        // TEMPORARILY DISABLED FOR TESTING
        // document.addEventListener("visibilitychange", handleVisibilityChange);
        // window.addEventListener("blur", handleWindowBlur);

        return () => {
            // document.removeEventListener("visibilitychange", handleVisibilityChange);
            // window.removeEventListener("blur", handleWindowBlur);
        };
    }, [maxWarnings]);

    return {
        warnings,
        showWarningOverlay,
        dismissWarning: () => setShowWarningOverlay(false),
        isTerminated,
    };
}
