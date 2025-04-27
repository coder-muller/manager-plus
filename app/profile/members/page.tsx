"use client"

import { useEffect, useState } from "react"
import { Member, MemberStatus } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { transformPhone } from "@/lib/transform"
import { sendDelete, sendGet, sendPost, sendPut } from "@/lib/fetchFunctions"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const memberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().nullable().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"] as const),
})

type MemberFormValues = z.infer<typeof memberSchema>

export default function Members() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<MemberStatus | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState("10")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [members, setMembers] = useState<Member[]>([])

  // Formulário de membro
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "ACTIVE",
    },
  })

  // Resetar formulário quando o membro selecionado mudar
  useEffect(() => {
    if (isDialogOpen) {
      form.reset({
        name: selectedMember?.name ?? "",
        email: selectedMember?.email ?? "",
        phone: selectedMember?.phone ?? "",
        address: selectedMember?.address ?? "",
        status: selectedMember?.status ?? "ACTIVE",
      })
    }
  }, [selectedMember, isDialogOpen, form])

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, status, perPage])

  const fetchMembers = async () => {
    setIsFetching(true)
    const userId = Cookies.get("userId")

    if (!userId) {
      toast.error("Usuário não encontrado")
      return
    }

    try {
      const members = await sendGet<Member[]>(`/members/${userId}`)
      setMembers(members)
    } catch (error) {
      console.error(error)
      toast.error("Erro ao buscar membros")
    } finally {
      setIsFetching(false)
    }
  }

  const handleAddMember = async (data: MemberFormValues) => {
    setIsLoading(true)
    try {
      const userId = Cookies.get("userId")
      if (!userId) {
        toast.error("Usuário não encontrado")
        return
      }

      await sendPost<Member, MemberFormValues>(`/members/${userId}`, data)
      fetchMembers()
      setIsDialogOpen(false)
      toast.success("Membro adicionado com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao adicionar membro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMember = async (data: MemberFormValues) => {
    if (!selectedMember) return
    
    setIsLoading(true)
    try {
      const userId = Cookies.get("userId")
      if (!userId) {
        toast.error("Usuário não encontrado")
        return
      }

      await sendPut<Member, MemberFormValues>(`/members/${userId}/${selectedMember.id}`, data)
      fetchMembers()
      setIsDialogOpen(false)
      toast.success("Membro atualizado com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar membro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!selectedMember) return
    
    setIsDeleting(true)
    try {
      const userId = Cookies.get("userId")

      if (!userId) {
        toast.error("Usuário não encontrado")
        return
      }

      if (!selectedMember.id) {
        toast.error("Membro não encontrado")
        return
      }

      await sendDelete<void>(`/members/${userId}/${selectedMember.id}`)

      setIsDialogOpen(false)
      setSelectedMember(null)
      fetchMembers()
      toast.success("Membro excluído com sucesso")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao excluir membro")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = (data: MemberFormValues) => {
    if (selectedMember) {
      handleEditMember(data)
    } else {
      handleAddMember(data)
    }
  }

  // Filter members based on search and status
  const filteredMembers = members.filter(member => {
    const nameNormalized = member.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    const searchNormalized = search
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    const matchesSearch = nameNormalized.includes(searchNormalized)
    const matchesStatus = status === "ALL" ? true : member.status === status
    return matchesSearch && matchesStatus
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredMembers.length / parseInt(perPage))
  const startIndex = (page - 1) * parseInt(perPage)
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + parseInt(perPage))

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full p-6 space-y-4 mt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Membros</h1>
        <div className="flex items-center gap-2">
          {members.length > 0 && (
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Pesquisar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <Select value={status} onValueChange={(value) => setStatus(value as MemberStatus | "ALL")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Ativos</SelectItem>
                  <SelectItem value="INACTIVE">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={() => {
            setSelectedMember(null)
            setIsDialogOpen(true)
          }}>
            Adicionar Membro
          </Button>
        </div>
      </div>

      {members.length > 0 ? (
        <Table className="border rounded">
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{transformPhone(member.phone ?? "")}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>
                      {member.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMember(member)
                        setIsDialogOpen(true)
                      }}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-3.5">Nenhum membro encontrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Nenhum membro cadastrado. Clique no botão <span className="font-bold">Adicionar Membro</span> para começar.</p>
        </div>
      )}

      {members.length > 0 && (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página</span>
            <Select value={perPage} onValueChange={setPerPage}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              key={page}
              variant={"secondary"}
              size="sm"
              onClick={() => setPage(page)}
              className="min-w-8"
            >
              {page}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMember ? "Editar Membro" : "Novo Membro"}
            </DialogTitle>
            <DialogDescription>
              {selectedMember ? "Edite as informações do membro" : "Crie um novo membro"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do membro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email do membro" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço do membro" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefone do membro" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Ativo</SelectItem>
                          <SelectItem value="INACTIVE">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                {selectedMember && (
                  <Button 
                    variant="destructive" 
                    type="button" 
                    onClick={handleDeleteMember} 
                    disabled={isLoading || isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Excluir"
                    )}
                  </Button>
                )}
                <Button type="submit" disabled={isLoading || isDeleting}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    selectedMember ? "Salvar" : "Criar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}