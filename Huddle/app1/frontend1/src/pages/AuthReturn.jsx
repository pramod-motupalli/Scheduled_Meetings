import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthReturn() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // We have returned from the microservice login
        sessionStorage.setItem("microservice_authenticated", "true");
        
        // Check if there is a redirect parameter in the URL
        const urlParams = new URLSearchParams(location.search);
        const redirectUrl = urlParams.get("redirect");
        
        if (redirectUrl) {
            // Navigate back to the meeting lobby
            navigate(redirectUrl);
            return;
        }
        
        // Fallback to dashboard if no redirect is specified
        navigate("/dashboard");
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-slate-600">Completing login...</span>
        </div>
    );
}
