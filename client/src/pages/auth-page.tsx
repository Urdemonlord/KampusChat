import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, Users, MessageCircle } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username/Email/NIM diperlukan"),
  password: z.string().min(1, "Password diperlukan"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof insertUserSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      name: "",
      nim: "",
      role: "mahasiswa",
      program: "",
      year: "",
    },
  });

  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">UNIMUS Chat</h1>
            <p className="text-muted-foreground mt-2">
              Aplikasi Chat Eksklusif Mahasiswa & Alumni
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Masuk ke Akun</CardTitle>
                  <CardDescription>
                    Gunakan username, email, atau NIM untuk masuk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username / Email / NIM</Label>
                      <Input
                        id="username"
                        data-testid="input-username"
                        {...loginForm.register("username")}
                        placeholder="Masukkan username, email, atau NIM"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        data-testid="input-password"
                        {...loginForm.register("password")}
                        placeholder="Masukkan password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      data-testid="button-login"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Masuk
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Buat Akun Baru</CardTitle>
                  <CardDescription>
                    Daftar sebagai mahasiswa atau alumni UNIMUS
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Nama Lengkap</Label>
                        <Input
                          id="reg-name"
                          data-testid="input-name"
                          {...registerForm.register("name")}
                          placeholder="Nama lengkap"
                        />
                        {registerForm.formState.errors.name && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input
                          id="reg-username"
                          data-testid="input-reg-username"
                          {...registerForm.register("username")}
                          placeholder="Username"
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        data-testid="input-email"
                        {...registerForm.register("email")}
                        placeholder="Email kampus (opsional)"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-nim">NIM (Opsional)</Label>
                        <Input
                          id="reg-nim"
                          data-testid="input-nim"
                          {...registerForm.register("nim")}
                          placeholder="Nomor Induk Mahasiswa"
                        />
                        {registerForm.formState.errors.nim && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.nim.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-role">Status</Label>
                        <Select
                          value={registerForm.watch("role")}
                          onValueChange={(value) => registerForm.setValue("role", value)}
                        >
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                            <SelectItem value="alumni">Alumni</SelectItem>
                            <SelectItem value="dosen">Dosen</SelectItem>
                          </SelectContent>
                        </Select>
                        {registerForm.formState.errors.role && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.role.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-program">Program Studi</Label>
                        <Input
                          id="reg-program"
                          data-testid="input-program"
                          {...registerForm.register("program")}
                          placeholder="Teknik Informatika"
                        />
                        {registerForm.formState.errors.program && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.program.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-year">Angkatan</Label>
                        <Input
                          id="reg-year"
                          data-testid="input-year"
                          {...registerForm.register("year")}
                          placeholder="2023"
                        />
                        {registerForm.formState.errors.year && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.year.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        data-testid="input-reg-password"
                        {...registerForm.register("password")}
                        placeholder="Minimal 6 karakter"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      data-testid="button-register"
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Daftar Sekarang
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-primary text-primary-foreground p-8 flex items-center justify-center">
        <div className="max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Terhubung dengan Komunitas UNIMUS</h2>
          </div>

          <div className="space-y-4 text-primary-foreground/80">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <p>Chat realtime dengan sistem PIN unik</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <p>Status 24 jam seperti BBM</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <p>Grup chat untuk setiap program studi</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <p>Broadcast info kampus terkini</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm">
            <Users className="w-4 h-4" />
            <span>Khusus mahasiswa dan alumni UNIMUS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
