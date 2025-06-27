
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { sanitizeInput, validateEmail } from "@/utils/sanitization";

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
      // Client-side validation
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);

      if (!sanitizedEmail || !sanitizedPassword) {
        setError("Email en wachtwoord zijn verplicht");
        return;
      }

      if (!validateEmail(sanitizedEmail)) {
        setError("Ongeldig email formaat");
        return;
      }

      if (sanitizedPassword.length < 6) {
        setError("Wachtwoord moet minimaal 6 karakters lang zijn");
        return;
      }

      const success = await login(sanitizedEmail, sanitizedPassword);
      if (!success) {
        setError("Ongeldige inloggegevens");
      }
    } catch (err) {
      console.error('Login form error:', err);
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setEmail(sanitized);
    if (error) setError(""); // Clear error on input change
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setPassword(sanitized);
    if (error) setError(""); // Clear error on input change
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
                    onChange={handleEmailChange}
                    required
                    placeholder="je@email.com"
                    className="border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                    maxLength={254} // RFC standard email max length
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-normal text-black">Wachtwoord</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    className="border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                    minLength={6}
                    maxLength={128}
                    autoComplete="current-password"
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
                disabled={loading || !email || !password}
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
