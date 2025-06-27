
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Crown,
  Shield,
  Mail,
  Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Users = () => {
  const { isManager } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const users = [
    {
      id: 1,
      name: "Sarah van Dam",
      email: "sarah.vandam@example.com",
      role: "Manager",
      status: "Actief",
      lastLogin: "2024-01-15",
      articlesCreated: 12,
      avatar: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Mike de Jong",
      email: "mike.dejong@example.com",
      role: "Editor",
      status: "Actief",
      lastLogin: "2024-01-14",
      articlesCreated: 8,
      avatar: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Lisa Bakker",
      email: "lisa.bakker@example.com",
      role: "Gebruiker",
      status: "Actief",
      lastLogin: "2024-01-12",
      articlesCreated: 3,
      avatar: "/placeholder.svg"
    },
    {
      id: 4,
      name: "Tom Peters",
      email: "tom.peters@example.com",
      role: "Editor",
      status: "Inactief",
      lastLogin: "2024-01-05",
      articlesCreated: 15,
      avatar: "/placeholder.svg"
    },
    {
      id: 5,
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      role: "Gebruiker",
      status: "Actief",
      lastLogin: "2024-01-13",
      articlesCreated: 2,
      avatar: "/placeholder.svg"
    }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Manager":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "Editor":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <UsersIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Manager":
        return <Badge className="bg-yellow-100 text-yellow-800">{role}</Badge>;
      case "Editor":
        return <Badge className="bg-blue-100 text-blue-800">{role}</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "Actief" 
      ? <Badge className="bg-green-100 text-green-800">{status}</Badge>
      : <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  };

  if (!isManager) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Geen toegang</h3>
        <p className="text-gray-600">Je hebt geen rechten om gebruikers te beheren.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gebruikers</h1>
          <p className="text-gray-600 mt-1">Beheer gebruikerstoegang en rollen</p>
        </div>
        <Button className="bg-clearbase-600 hover:bg-clearbase-700">
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe gebruiker
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Zoek gebruikers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Totaal gebruikers
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Actieve gebruikers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === "Actief").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Managers
            </CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "Manager").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Editors
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === "Editor").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gebruikersoverzicht</CardTitle>
          <CardDescription>Beheer alle gebruikers en hun rollen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="w-3 h-3" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Laatst ingelogd: {new Date(user.lastLogin).toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {user.articlesCreated} artikelen
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Geen gebruikers gevonden</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? "Probeer een andere zoekterm." 
              : "Er zijn nog geen gebruikers beschikbaar."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Users;
