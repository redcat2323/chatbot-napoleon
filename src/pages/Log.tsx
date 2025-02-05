import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface LogStats {
  weeklyCount: number;
  monthlyCount: number;
  yearlyCount: number;
  totalUsers: number;
  averageQueriesPerUser: number;
}

interface ChartData {
  date: string;
  count: number;
}

interface CustomInstruction {
  id: string;
  title: string;
  content: string;
}

const Log = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingInstruction, setEditingInstruction] = useState<CustomInstruction | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["logStats"],
    queryFn: async () => {
      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(2025, 0, 1);

      const { count: weeklyCount, error: weeklyError } = await supabase
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString());

      const { count: monthlyCount, error: monthlyError } = await supabase
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      const { count: yearlyCount, error: yearlyError } = await supabase
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfYear.toISOString());

      const { data: users, error: usersError } = await supabase
        .from('usage_logs')
        .select('user_id')
        .not('user_id', 'is', null);

      if (weeklyError || monthlyError || yearlyError || usersError) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const uniqueUsers = new Set(users?.map(log => log.user_id));
      const totalUsers = uniqueUsers.size;
      const averageQueriesPerUser = totalUsers > 0 ? Math.round((yearlyCount || 0) / totalUsers) : 0;

      return {
        weeklyCount: weeklyCount || 0,
        monthlyCount: monthlyCount || 0,
        yearlyCount: yearlyCount || 0,
        totalUsers,
        averageQueriesPerUser,
      };
    },
    enabled: isAuthenticated,
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ["logChartData"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_logs')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dailyCount = data.reduce((acc: Record<string, number>, item) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(dailyCount).map(([date, count]) => ({
        date,
        count,
      }));
    },
    enabled: isAuthenticated,
  });

  const { data: instructions, refetch: refetchInstructions } = useQuery({
    queryKey: ["customInstructions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_instructions")
        .select("*")
        .eq('app_id', 'napoleon')  // Filter instructions for Napoleon app only
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CustomInstruction[];
    },
    enabled: isAuthenticated,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingInstruction) {
        const { error } = await supabase
          .from("custom_instructions")
          .update({ title, content })
          .eq("id", editingInstruction.id)
          .eq('app_id', 'napoleon');  // Ensure we only update Napoleon's instructions

        if (error) throw error;
        toast({
          title: "Instrução atualizada",
          description: "A instrução foi atualizada com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from("custom_instructions")
          .insert([{ 
            title, 
            content,
            app_id: 'napoleon'  // Set app_id when creating new instructions
          }]);

        if (error) throw error;
        toast({
          title: "Instrução criada",
          description: "A instrução foi criada com sucesso.",
        });
      }

      setTitle("");
      setContent("");
      setEditingInstruction(null);
      refetchInstructions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a instrução.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (instruction: CustomInstruction) => {
    setEditingInstruction(instruction);
    setTitle(instruction.title);
    setContent(instruction.content);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("custom_instructions")
        .delete()
        .eq("id", id)
        .eq('app_id', 'napoleon');  // Ensure we only delete Napoleon's instructions

      if (error) throw error;

      toast({
        title: "Instrução removida",
        description: "A instrução foi removida com sucesso.",
      });
      refetchInstructions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover a instrução.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Painel de Monitoramento</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Instrução
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editingInstruction ? "Editar Instrução" : "Nova Instrução"}</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Input
                  placeholder="Título da instrução"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Conteúdo da instrução"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingInstruction ? "Atualizar" : "Criar"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {isLoadingStats ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))
        ) : (
          <>
            <StatCard
              title="Consultas na Semana"
              value={stats?.weeklyCount || 0}
            />
            <StatCard
              title="Consultas no Mês"
              value={stats?.monthlyCount || 0}
            />
            <StatCard
              title="Consultas em 2025"
              value={stats?.yearlyCount || 0}
            />
            <StatCard
              title="Total de Usuários"
              value={stats?.totalUsers || 0}
            />
            <StatCard
              title="Média de Consultas/Usuário"
              value={stats?.averageQueriesPerUser || 0}
            />
          </>
        )}
      </div>

      {isLoadingChart ? (
        <Skeleton className="h-[400px] w-full mb-8" />
      ) : (
        <div className="mb-8">
          <UsageChart 
            data={chartData || []} 
            title="Histórico de Consultas"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Instruções Personalizadas</h2>
          <div className="space-y-4">
            {instructions?.map((instruction) => (
              <div
                key={instruction.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{instruction.title}</h3>
                    <p className="text-gray-600 mt-1">{instruction.content}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(instruction)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(instruction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Log;
