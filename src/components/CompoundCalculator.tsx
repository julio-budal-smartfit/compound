"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  month: number;
  value: number;
}

const CompoundCalculator = () => {
  const [principal, setPrincipal] = useState<string>('1000');
  const [rate, setRate] = useState<string>('5');
  const [time, setTime] = useState<string>('5');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('100');
  const [result, setResult] = useState<number>(0);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { toast } = useToast();

  const calculateCompoundInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const m = parseFloat(monthlyContribution);

    if (isNaN(p) || isNaN(r) || isNaN(t) || isNaN(m)) {
      toast({
        title: "Erro",
        description: "Por favor, insira valores numéricos válidos.",
        variant: "destructive",
      });
      return;
    }

    const monthlyRate = r / 12;
    const totalMonths = t * 12;
    
    const data: ChartData[] = [];
    let balance = p;
    
    for (let month = 0; month <= totalMonths; month++) {
      data.push({
        month,
        value: balance,
      });
      balance = balance * (1 + monthlyRate) + m;
    }

    setChartData(data);
    setResult(balance);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Calculadora de Juros Compostos</CardTitle>
          <CardDescription>
            Calcule o crescimento do seu investimento ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principal">Investimento Inicial (R$)</Label>
                <Input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Taxa de Juros Anual (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Período (Anos)</Label>
                <Input
                  id="time"
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly">Aporte Mensal (R$)</Label>
                <Input
                  id="monthly"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={calculateCompoundInterest} className="w-full">
              Calcular
            </Button>

            {result > 0 && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-slate-100 rounded-lg">
                  <p className="text-lg">Montante Final</p>
                  <p className="text-3xl font-bold">
                    {result.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        label={{ value: 'Meses', position: 'bottom' }} 
                      />
                      <YAxis 
                        label={{ 
                          value: 'Valor (R$)', 
                          angle: -90, 
                          position: 'insideLeft' 
                        }}
                        tickFormatter={(value) => 
                          value.toLocaleString('pt-BR', {
                            notation: 'compact',
                            currency: 'BRL'
                          })
                        }
                      />
                      <Tooltip 
                        formatter={(value: number) => 
                          value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })
                        }
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompoundCalculator;
