
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";
import { sanitizeInput, validateEmail } from "@/utils/sanitization";
import { cleanupAuthState } from "@/hooks/useAuthCleanup";
import PasswordResetForm from "./PasswordResetForm";

const ConsolidatedAuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(loginData.email);
      const sanitizedPassword = sanitizeInput(loginData.password);

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

      // Clean up existing state before login
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn('Failed to sign out before login:', err);
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        setError("Ongeldige inloggegevens");
        console.error('Login error:', error);
      } else {
        toast({
          title: "Succesvol ingelogd",
          description: "Welkom terug!"
        });
        // Force page reload for clean state
        window.location.href = "/";
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(signupData.email);
      const sanitizedPassword = sanitizeInput(signupData.password);
      const sanitizedFirstName = sanitizeInput(signupData.firstName);
      const sanitizedLastName = sanitizeInput(signupData.lastName);

      if (!sanitizedEmail || !sanitizedPassword || !sanitizedFirstName || !sanitizedLastName) {
        setError("Alle velden zijn verplicht");
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

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: {
          data: {
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError("Dit email adres is al geregistreerd");
        } else {
          setError("Er is een fout opgetreden bij het registreren");
        }
        console.error('Signup error:', error);
      } else {
        toast({
          title: "Account aangemaakt",
          description: "Check je email om je account te bevestigen"
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setIsLoading(false);
    }
  };

  if (showPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <PasswordResetForm onBack={() => setShowPasswordReset(false)} />
        </div>
      </div>
    );
  }

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
              <p className="text-gray-500 mt-3 text-base">Je kennisbank platform</p>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Inloggen</TabsTrigger>
                <TabsTrigger value="signup">Registreren</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-sm font-normal text-black">
                      E-mailadres
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="je@email.com"
                        value={loginData.email}
                        onChange={(e) => {
                          const sanitized = sanitizeInput(e.target.value);
                          setLoginData(prev => ({ ...prev, email: sanitized }));
                          if (error) setError("");
                        }}
                        className="pl-10 border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                        required
                        maxLength={254}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-sm font-normal text-black">
                      Wachtwoord
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => {
                          const sanitized = sanitizeInput(e.target.value);
                          setLoginData(prev => ({ ...prev, password: sanitized }));
                          if (error) setError("");
                        }}
                        className="pl-10 pr-10 border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                        required
                        minLength={6}
                        maxLength={128}
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="text-blue-500 hover:text-blue-600 p-0 h-auto font-normal"
                      onClick={() => setShowPasswordReset(true)}
                    >
                      Wachtwoord vergeten?
                    </Button>
                  </div>
                  
                  {error && (
                    <Alert className="border-gray-200 bg-white">
                      <AlertDescription className="text-black">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-normal bg-blue-500 text-black hover:bg-blue-600"
                    disabled={isLoading || !loginData.email || !loginData.password}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Inloggen...
                      </div>
                    ) : (
                      "Inloggen"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="signup-firstname" className="text-sm font-normal text-black">
                        Voornaam
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="signup-firstname"
                          type="text"
                          placeholder="Jan"
                          value={signupData.firstName}
                          onChange={(e) => {
                            const sanitized = sanitizeInput(e.target.value);
                            setSignupData(prev => ({ ...prev, firstName: sanitized }));
                            if (error) setError("");
                          }}
                          className="pl-10 border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                          required
                          maxLength={50}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="signup-lastname" className="text-sm font-normal text-black">
                        Achternaam
                      </Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Doe"
                        value={signupData.lastName}
                        onChange={(e) => {
                          const sanitized = sanitizeInput(e.target.value);
                          setSignupData(prev => ({ ...prev, lastName: sanitized }));
                          if (error) setError("");
                        }}
                        className="border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                        required
                        maxLength={50}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signup-email" className="text-sm font-normal text-black">
                      E-mailadres
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="je@email.com"
                        value={signupData.email}
                        onChange={(e) => {
                          const sanitized = sanitizeInput(e.target.value);
                          setSignupData(prev => ({ ...prev, email: sanitized }));
                          if (error) setError("");
                        }}
                        className="pl-10 border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                        required
                        maxLength={254}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="signup-password" className="text-sm font-normal text-black">
                      Wachtwoord
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => {
                          const sanitized = sanitizeInput(e.target.value);
                          setSignupData(prev => ({ ...prev, password: sanitized }));
                          if (error) setError("");
                        }}
                        className="pl-10 pr-10 border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
                        required
                        minLength={6}
                        maxLength={128}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
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
                    disabled={isLoading || !signupData.email || !signupData.password || !signupData.firstName || !signupData.lastName}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Registreren...
                      </div>
                    ) : (
                      "Account aanmaken"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

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

export default ConsolidatedAuthPage;
