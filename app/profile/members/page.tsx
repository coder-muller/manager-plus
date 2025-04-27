"use client"

import { useEffect, useState } from "react"
import { Member, MemberStatus } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MemberForm } from "./member-form"
import { transformPhone } from "@/lib/transform"

// Fake data for testing
const fakeMembers: Member[] = [
  {
    id: "1",
    userId: "user1",
    name: "Ana Silva",
    email: "ana.silva@example.com",
    phone: "21987654321",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "2",
    userId: "user1",
    name: "Bruno Costa",
    email: "bruno.costa@example.com",
    phone: "11981234567",
    address: "Rua das Flores, 123",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "3",
    userId: "user1",
    name: "Carlos Oliveira",
    email: "carlos.oliveira@example.com",
    phone: "31999887766",
    address: "Rua das Flores, 123",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "4",
    userId: "user1",
    name: "Daniela Souza",
    email: "daniela.souza@example.com",
    phone: "21991234567",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "5",
    userId: "user1",
    name: "Eduardo Alves",
    email: "eduardo.alves@example.com",
    phone: "11998765432",
    address: "Rua das Flores, 123",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "6",
    userId: "user1",
    name: "Fernanda Santos",
    email: "fernanda.santos@example.com",
    phone: "41992345678",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "7",
    userId: "user1",
    name: "Gabriel Pereira",
    email: "gabriel.pereira@example.com",
    phone: "51991234567",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "8",
    userId: "user1",
    name: "Helena Rodrigues",
    email: "helena.rodrigues@example.com",
    phone: "61991234567",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "9",
    userId: "user1",
    name: "Guilherme Müller",
    email: "guilhermemuller@gmail.com",
    phone: "53999539445",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "10",
    userId: "user1",
    name: "Juliana Gomes",
    phone: "81991234567",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "11",
    userId: "user1",
    name: "Karina Ribeiro",
    email: "karina.ribeiro@example.com",
    phone: "91991234567",
    address: "Rua das Flores, 123",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "12",
    userId: "user1",
    name: "Lucas Dias",
    email: "lucas.dias@example.com",
    phone: "11977665544",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "13",
    userId: "user1",
    name: "Mariana Carvalho",
    email: "mariana.carvalho@example.com",
    phone: "21988776655",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "14",
    userId: "user1",
    name: "Nicolas Lima",
    email: "nicolas.lima@example.com",
    phone: "31966554433",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "15",
    userId: "user1",
    name: "Olivia Barbosa",
    email: "olivia.barbosa@example.com",
    phone: "51944332211",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "16",
    userId: "user1",
    name: "Pedro Rocha",
    email: "pedro.rocha@example.com",
    phone: "51944332211",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "17",
    userId: "user1",
    name: "Rafaela Martins",
    email: "rafaela.martins@example.com",
    phone: "61955443322",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "18",
    userId: "user1",
    name: "Samuel Rodrigues",
    email: "samuel.rodrigues@example.com",
    phone: "71966778899",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "19",
    userId: "user1",
    name: "Tatiana Pinto",
    email: "tatiana.pinto@example.com",
    phone: "81999887766",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: "20",
    userId: "user1",
    name: "Vinicius Moreira",
    email: "vinicius.moreira@example.com",
    phone: "91977665544",
    status: "INACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    payments: [],
    user: {
      id: "user1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password",
      valid: true,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
]

export default function Members() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<MemberStatus | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState("10")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, status, perPage])

  // Filter members based on search and status
  const filteredMembers = fakeMembers.filter(member => {
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

  return (
    <div className="w-full p-6 space-y-4 mt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Membros</h1>
        <div className="flex items-center gap-2">
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedMember(null)}>
                Adicionar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedMember ? "Editar Membro" : "Novo Membro"}
                </DialogTitle>
                <DialogDescription>
                  {selectedMember ? "Edite as informações do membro" : "Crie um novo membro"}
                </DialogDescription>
              </DialogHeader>
              <MemberForm
                member={selectedMember}
                isLoading={isLoading}
                isDeleting={isDeleting}
                onSubmit={(data) => {
                  console.log("Form submitted:", data)
                  setIsLoading(true)
                  setTimeout(() => {
                    setIsLoading(false)
                    setIsDialogOpen(false)
                  }, 1000)
                }}
                onDelete={() => {
                  console.log("Deleting member:", selectedMember)
                  setIsDeleting(true)
                  setTimeout(() => {
                    setIsDeleting(false)
                    setIsDialogOpen(false)
                  }, 1000)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
          {paginatedMembers.map((member) => (
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
          ))}
        </TableBody>
      </Table>

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
    </div>
  )
}