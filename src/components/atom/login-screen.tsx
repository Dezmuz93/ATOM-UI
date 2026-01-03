
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtomIcon } from "../icons";
import { Loader } from "lucide-react";
import { api } from "@/lib/api";

interface LoginScreenProps {
    onLogin: (apiUrl: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
    const [apiUrl, setApiUrl] = useState("/");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleVerifyAndLogin = async () => {
        const trimmedApiUrl = apiUrl.trim();

        if (!trimmedApiUrl) {
            setError("Please enter an API Server Address.");
            return;
        }

        // For mock API, we skip the http check
        if (trimmedApiUrl !== '/' && !trimmedApiUrl.startsWith("http://") && !trimmedApiUrl.startsWith("https://")) {
            setError("Please enter a valid URL (e.g., http://192.168.0.23:8000) or '/' for mock API.");
            return;
        }

        setIsLoading(true);
        setError("");

       try {
            const response = await api('/api/system/health', {}, trimmedApiUrl);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data?.status === "ok") {
                onLogin(trimmedApiUrl);
            } else {
                throw new Error("Health check failed: status not ok");
            }

        } catch (e) {
            console.error(e);
            setError("Could not connect to the API server. Core functions may be unavailable.");
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleContinueAnyway = () => {
        onLogin(apiUrl.trim());
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
             <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm">
                <CardHeader className="items-center text-center">
                    <AtomIcon className="w-24 h-24 text-primary" />
                    <CardTitle className="text-2xl font-headline">A.T.O.M Interface</CardTitle>
                    <CardDescription>Connect to A.T.O.M Backend</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-url">API Server Address</Label>
                        <Input 
                            id="api-url"
                            type="url"
                            placeholder="e.g., http://192.168.1.100:8000"
                            value={apiUrl}
                            onChange={(e) => {
                                setApiUrl(e.target.value);
                                setError("");
                            }}
                            className="bg-background/50"
                            disabled={isLoading}
                        />
                         <p className="text-xs text-muted-foreground pt-1">Enter <code className="bg-muted px-1 py-0.5 rounded-sm">/</code> to use the built-in mock API.</p>
                    </div>
                    {error && <p className="text-sm text-yellow-500/80 text-center">{error}</p>}
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    {error ? (
                        <>
                         <Button onClick={handleContinueAnyway} className="w-full" variant="secondary">
                            Continue Anyway
                        </Button>
                         <Button onClick={handleVerifyAndLogin} className="w-full" variant="outline">
                            Retry
                        </Button>
                        </>
                    ) : (
                         <Button onClick={handleVerifyAndLogin} className="w-full bg-primary/90 hover:bg-primary text-primary-foreground" disabled={isLoading || !apiUrl}>
                            {isLoading && <Loader className="animate-spin mr-2"/>}
                            {isLoading ? "Verifying..." : "Connect"}
                        </Button>
                    )}
                </CardFooter>
             </Card>
        </div>
    )
}
