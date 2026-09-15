import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import apiClient from '../../services/apiClient';
export function NotificationsPage() {
    const cache = useQueryClient();
    const query = useQuery({ queryKey: ['notifications'], queryFn: async () => (await apiClient.get('/notifications', { params: { limit: 50 } })).data });
    const refresh = () => cache.invalidateQueries({ queryKey: ['notifications'] });
    const markAll = useMutation({ mutationFn: () => apiClient.post('/notifications/mark-all/read'), onSuccess: refresh });
    const markOne = useMutation({ mutationFn: (id) => apiClient.patch(`/notifications/${id}/read`), onSuccess: refresh });
    const remove = useMutation({ mutationFn: (id) => apiClient.delete(`/notifications/${id}`), onSuccess: refresh });
    if (query.isLoading)
        return <div className="py-12 text-center text-gray-500">Loading notifications…</div>;
    if (query.isError)
        return <Alert type="error" message="Notifications could not be loaded."/>;
    return <div className="mx-auto max-w-4xl"><div className="mb-6 flex items-center justify-between"><div><h1 className="text-3xl font-bold">Notifications</h1><p className="mt-1 text-gray-600">{query.data.unreadCount || 0} unread updates</p></div><Button variant="outline" isLoading={markAll.isPending} onClick={() => markAll.mutate()}><CheckCheck className="mr-2 inline w-4 h-4"/>Mark all read</Button></div><Card><CardContent className="p-0">{query.data.data?.length ? <div className="divide-y">{query.data.data.map((item) => <div key={item._id} className={`flex gap-4 p-5 ${!item.isRead ? 'bg-blue-50/60' : ''}`}><Bell className="mt-1 h-5 w-5 shrink-0 text-blue-600"/><div className="flex-1"><p className="font-semibold text-gray-900">{item.title}</p><p className="mt-1 text-sm text-gray-600">{item.message}</p><p className="mt-2 text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p></div><div className="flex gap-1">{!item.isRead && <button aria-label="Mark as read" onClick={() => markOne.mutate(item._id)} className="h-9 w-9 rounded hover:bg-white"><CheckCheck className="m-auto h-4 w-4"/></button>}<button aria-label="Delete notification" onClick={() => remove.mutate(item._id)} className="h-9 w-9 rounded text-red-600 hover:bg-red-50"><Trash2 className="m-auto h-4 w-4"/></button></div></div>)}</div> : <div className="py-14 text-center text-gray-500">You’re all caught up. New ticket and asset activity will appear here.</div>}</CardContent></Card></div>;
}
