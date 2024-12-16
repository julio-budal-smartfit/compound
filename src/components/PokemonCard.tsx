"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Search, Filter, Sword, Shield, Zap } from 'lucide-react';

interface Pokemon {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

interface PokemonSpecies {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
    };
  }>;
}

const PokemonCard = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemonSpecies, setPokemonSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("info");
  const { toast } = useToast();

  const typeColors: { [key: string]: string } = {
    normal: "bg-gray-400",
    fire: "bg-red-500",
    water: "bg-blue-500",
    electric: "bg-yellow-400",
    grass: "bg-green-500",
    ice: "bg-cyan-300",
    fighting: "bg-red-700",
    poison: "bg-purple-500",
    ground: "bg-yellow-600",
    flying: "bg-indigo-400",
    psychic: "bg-pink-500",
    bug: "bg-lime-500",
    rock: "bg-yellow-800",
    ghost: "bg-purple-700",
    dragon: "bg-indigo-600",
    dark: "bg-gray-800",
    steel: "bg-gray-500",
    fairy: "bg-pink-300",
  };

  const searchPokemon = async () => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const searchQuery = searchTerm.toLowerCase();
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery}`);
      const data = await response.json();
      setPokemon(data);

      // Fetch species data for description
      const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`);
      const speciesData = await speciesResponse.json();
      setPokemonSpecies(speciesData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Pokémon não encontrado. Verifique o nome ou número.",
        variant: "destructive",
      });
      console.log(error)
      setPokemon(null);
      setPokemonSpecies(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatColor = (value: number): string => {
    if (value >= 150) return "bg-red-500";
    if (value >= 100) return "bg-orange-500";
    if (value >= 70) return "bg-yellow-500";
    if (value >= 40) return "bg-green-500";
    return "bg-blue-500";
  };

  const formatStatName = (name: string): string => {
    const statNames: { [key: string]: string } = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp. Attack',
      'special-defense': 'Sp. Defense',
      'speed': 'Speed'
    };
    return statNames[name] || name;
  };

  const getDescription = (): string => {
    if (!pokemonSpecies) return "";
    const enDescription = pokemonSpecies.flavor_text_entries.find(
      entry => entry.language.name === "en"
    );
    return enDescription ? enDescription.flavor_text.replace(/\f/g, ' ') : "";
  };

  const statsData = pokemon ? pokemon.stats.map(stat => ({
    subject: formatStatName(stat.stat.name),
    value: stat.base_stat
  })) : [];

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPokemon();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Modern Pokédex
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Explore e analyze Pokémon com estatísticas detalhadas e visualizações avançadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busque por nome ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-8"
              />
            </div>
            <Button onClick={searchPokemon}>Buscar</Button>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {pokemon && !loading && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                  <img
                    src={pokemon.sprites.other['official-artwork'].front_default}
                    alt={pokemon.name}
                    className="w-36 h-36"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
                    <span className="text-lg text-muted-foreground">#{pokemon.id.toString().padStart(3, '0')}</span>
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    {pokemon.types.map((type) => (
                      <Badge key={type.type.name} className={`${typeColors[type.type.name]} text-white`}>
                        {type.type.name}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {getDescription()}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">{pokemon.height / 10}m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sword className="h-4 w-4" />
                      <span className="text-sm">{pokemon.weight / 10}kg</span>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                  <TabsTrigger value="moves">Habilidades</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div>
                          <Label>Habilidades</Label>
                          <div className="flex gap-2 mt-2">
                            {pokemon.abilities.map((ability) => (
                              <Badge 
                                key={ability.ability.name} 
                                variant="outline"
                                className="capitalize"
                              >
                                {ability.ability.name.replace('-', ' ')}
                                {ability.is_hidden && ' (Hidden)'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <Label>Dimensões</Label>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Altura</span>
                              <span className="text-lg font-medium">{pokemon.height / 10}m</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm text-muted-foreground">Peso</span>
                              <span className="text-lg font-medium">{pokemon.weight / 10}kg</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        {pokemon.stats.map((stat) => (
                          <div key={stat.stat.name} className="space-y-2">
                            <div className="flex justify-between">
                              <Label className="capitalize">{formatStatName(stat.stat.name)}</Label>
                              <span className="text-sm font-medium">{stat.base_stat}</span>
                            </div>
                            <Progress 
                              value={stat.base_stat} 
                              max={255} 
                              className={getStatColor(stat.base_stat)} 
                            />
                          </div>
                        ))}
                      </div>

                      <div className="h-[300px] mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={statsData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 255]} />
                            <Radar
                              name="Stats"
                              dataKey="value"
                              stroke="#2563eb"
                              fill="#3b82f6"
                              fillOpacity={0.6}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="moves">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid gap-4">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span>Lista de movimentos em desenvolvimento</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PokemonCard;
