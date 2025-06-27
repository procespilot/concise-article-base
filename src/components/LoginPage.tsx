
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Ongeldige inloggegevens");
      }
    } catch (err) {
      setError("Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border border-gray-200">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-spacegray-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">CB</span>
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-black">
                ClearBase
              </CardTitle>
              <p className="text-spacegray-500 mt-2">Log in op je kennisbank</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-spacegray-700">E-mailadres</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="je@email.com"
                    className="h-11 border-gray-300 focus:border-spacegray-500 focus:ring-spacegray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-spacegray-700">Wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 border-gray-300 focus:border-spacegray-500 focus:ring-spacegray-500"
                  />
                </div>
              </div>
              
              {error && (
                <Alert className="border-spacegray-300 bg-spacegray-50">
                  <AlertDescription className="text-spacegray-700">{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-spacegray-600 hover:bg-spacegray-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Inloggen...
                  </div>
                ) : (
                  "Inloggen"
                )}
              </Button>
            </form>
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-center mb-3 text-spacegray-700">Demo accounts</p>
              <div className="space-y-2 text-sm text-spacegray-600 text-center">
                <p><span className="font-medium">Manager:</span> manager@example.com / password</p>
                <p><span className="font-medium">Gebruiker:</span> user@example.com / password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
