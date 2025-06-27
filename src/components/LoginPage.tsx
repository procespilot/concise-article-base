
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
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="mx-auto w-16 h-16 bg-blue-500 flex items-center justify-center">
              <span className="text-2xl font-medium text-black">CB</span>
            </div>
            <div>
              <CardTitle className="text-4xl font-light text-black">
                ClearBase
              </CardTitle>
              <p className="text-gray-500 mt-3 text-base">Log in op je kennisbank</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-normal text-black">E-mailadres</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="je@email.com"
                    className="border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-normal text-black">Wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                  />
                </div>
              </div>
              
              {error && (
                <Alert className="border-gray-200 bg-white">
                  <AlertDescription className="text-black">{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-normal bg-blue-500 text-black hover:bg-blue-600"
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
            
            <div className="mt-8 p-6 bg-white border border-gray-200">
              <p className="text-sm font-normal text-center mb-4 text-black uppercase tracking-wide">Demo accounts</p>
              <div className="space-y-2 text-sm text-gray-600 text-center">
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
