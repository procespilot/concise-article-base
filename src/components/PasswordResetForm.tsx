
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";
import { sanitizeInput, validateEmail } from "@/utils/sanitization";

interface PasswordResetFormProps {
  onBack: () => void;
}

const PasswordResetForm = ({ onBack }: PasswordResetFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(email);

      if (!sanitizedEmail) {
        setError("Email is verplicht");
        return;
      }

      if (!validateEmail(sanitizedEmail)) {
        setError("Ongeldig email formaat");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        setError("Er is een fout opgetreden. Probeer het opnieuw.");
        console.error('Password reset error:', error);
      } else {
        setIsSuccess(true);
        toast({
          title: "Email verstuurd",
          description: "Check je inbox voor de wachtwoord reset link"
        });
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError("Er is een onverwachte fout opgetreden");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="mx-auto w-16 h-16 bg-green-500 flex items-center justify-center rounded-full">
            <Mail className="text-2xl text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-light text-black">
              Email verstuurd
            </CardTitle>
            <p className="text-gray-500 mt-3 text-base">
              Check je inbox voor de wachtwoord reset instructies
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <Button 
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar inloggen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 bg-white">
      <CardHeader className="text-center space-y-6 pb-8">
        <div className="mx-auto w-16 h-16 bg-blue-500 flex items-center justify-center">
          <span className="text-2xl font-medium text-black">CB</span>
        </div>
        <div>
          <CardTitle className="text-4xl font-light text-black">
            Wachtwoord vergeten
          </CardTitle>
          <p className="text-gray-500 mt-3 text-base">
            Voer je email adres in om je wachtwoord te resetten
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="reset-email" className="text-sm font-normal text-black">
              E-mailadres
            </Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => {
                const sanitized = sanitizeInput(e.target.value);
                setEmail(sanitized);
                if (error) setError("");
              }}
              required
              placeholder="je@email.com"
              className="border border-gray-200 bg-white focus:border-blue-500 focus:ring-0 focus:outline-none h-12 text-base text-black"
              maxLength={254}
              autoComplete="email"
            />
          </div>
          
          {error && (
            <Alert className="border-gray-200 bg-white">
              <AlertDescription className="text-black">{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-normal bg-blue-500 text-black hover:bg-blue-600"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Email versturen...
              </div>
            ) : (
              "Wachtwoord reset link versturen"
            )}
          </Button>
        </form>
        
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar inloggen
        </Button>
      </CardContent>
    </Card>
  );
};

export default PasswordResetForm;
