import { useState, useRef } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '@/atoms/auth.atoms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/api/user.api';
import { Trash2, Camera } from 'lucide-react';

export function ProfilePage() {
  const [user, setUser] = useAtom(userAtom);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async () => {
    try {
      const updatedUser = await userApi.updateProfile({ name, avatarUrl: avatar || '' });
      setUser(updatedUser);
      navigate('/');
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Профіль користувача</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-28 w-28 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-primary">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl font-bold">{name ? name[0].toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="mr-2 h-4 w-4" /> Змінити
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setAvatar(null)}>
                <Trash2 className="mr-2 h-4 w-4" /> Видалити
              </Button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="space-y-2">
            <Label>Ім'я</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <Button className="flex-1" onClick={handleUpdate}>Зберегти зміни</Button>
            <Button className="flex-1" variant="outline" onClick={() => navigate('/')}>Скасувати</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
