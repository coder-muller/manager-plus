"use client"

import { useEffect, useState } from "react"
import { Member, Payment, PaymentStatus } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { formatCurrency, formatDate, getMonthName } from "@/lib/transform"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogFooter, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogDescription } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

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
  }
]

// Generate fake payments
const createFakePayment = (id: string, memberId: string, month: number, year: number, status: PaymentStatus): Payment => {
  const member = fakeMembers.find(m => m.id === memberId) as Member
  const paidAt = status === "PAID" ? new Date(year, month - 1, Math.floor(Math.random() * 28) + 1).toISOString() : null

  return {
    id,
    memberId,
    month,
    year,
    amount: 100 + Math.floor(Math.random() * 50),
    status,
    paidAt,
    observation: status === "PAID" ? "Pagamento efetuado" : "Aguardando pagamento",
    createdAt: new Date(year, month - 1, 1).toISOString(),
    updatedAt: new Date(year, month - 1, 1).toISOString(),
    member
  }
}

// Generate 6 months of payments for each member
const fakePayments: Payment[] = []
const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

fakeMembers.forEach((member) => {
  for (let i = 0; i < 6; i++) {
    const month = ((currentMonth - i) <= 0 ? currentMonth - i + 12 : currentMonth - i)
    const year = month > currentMonth ? currentYear - 1 : currentYear

    // Some payments are paid, others are pending
    const status: PaymentStatus = i < 3 ? "PAID" : "PENDING"
    const paymentId = `payment-${member.id}-${month}-${year}`

    fakePayments.push(createFakePayment(paymentId, member.id, month, year, status))
  }
})

// Form schema for invoice generation
const generateInvoiceSchema = z.object({
  month: z.string().min(1, "Mês é obrigatório"),
  year: z.string().min(1, "Ano é obrigatório"),
  value: z.string().min(1, "Valor é obrigatório").refine((value) => {
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && numericValue > 0;
  }, {
    message: "Valor deve ser um número positivo",
  }),
})

type GenerateInvoiceFormValues = z.infer<typeof generateInvoiceSchema>

// Tipos de períodos de filtro
type PeriodFilter = 
  | "current_month" 
  | "last_month" 
  | "last_3_months" 
  | "last_year" 
  | "specific"

export default function Payments() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<PaymentStatus | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState("10")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Novos estados para filtro de período
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("current_month")
  const [specificMonth, setSpecificMonth] = useState<string>(String(currentMonth))
  const [specificYear, setSpecificYear] = useState<string>(String(currentYear))

  const generateInvoiceForm = useForm<GenerateInvoiceFormValues>({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: {
      month: String(new Date().getMonth() + 2),
      year: String(new Date().getFullYear()),
      value: "",
    },
  })

  useEffect(() => {
    setPage(1)
  }, [search, status, periodFilter, specificMonth, specificYear, perPage])

  // Filtrar pagamentos com base nos critérios selecionados
  const filteredPayments = fakePayments.filter(payment => {
    // Se houver busca por membro, usar apenas esse filtro
    if (search) {
      const memberNameNormalized = payment.member.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
      const searchNormalized = search
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
      const matchesSearch = memberNameNormalized.includes(searchNormalized)
      
      // Quando busca por membro, ignorar filtros de período e aplicar somente status
      return matchesSearch && (status === "ALL" ? true : payment.status === status)
    }

    // Filtro por status
    const matchesStatus = status === "ALL" ? true : payment.status === status

    // Filtro por período
    let matchesPeriod = false;
    const paymentDate = new Date(payment.year, payment.month - 1, 1);
    const now = new Date();
    
    switch (periodFilter) {
      case "current_month":
        matchesPeriod = 
          payment.month === currentMonth && 
          payment.year === currentYear;
        break;
      
      case "last_month":
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        matchesPeriod = 
          payment.month === lastMonth && 
          payment.year === lastMonthYear;
        break;
      
      case "last_3_months":
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 2); // -2 porque já estamos no mês atual
        matchesPeriod = paymentDate >= threeMonthsAgo;
        break;
      
      case "last_year":
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        matchesPeriod = paymentDate >= oneYearAgo;
        break;
      
      case "specific":
        matchesPeriod = 
          payment.month === parseInt(specificMonth) && 
          payment.year === parseInt(specificYear);
        break;
      
      default:
        matchesPeriod = true;
    }

    return matchesStatus && matchesPeriod;
  });

  // Sort payments by date (most recent first)
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const dateA = new Date(a.year, a.month - 1)
    const dateB = new Date(b.year, b.month - 1)
    return dateB.getTime() - dateA.getTime()
  })

  // Calculate pagination
  const totalPages = Math.ceil(sortedPayments.length / parseInt(perPage))
  const startIndex = (page - 1) * parseInt(perPage)
  const paginatedPayments = sortedPayments.slice(startIndex, startIndex + parseInt(perPage))

  const handleGenerateInvoices = (data: GenerateInvoiceFormValues) => {
    setIsLoading(true)
    console.log("Generating invoices for", {
      month: data.month,
      year: data.year,
      value: data.value,
    })

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsDialogOpen(false)
    }, 1500)
  }

  return (
    <div className="w-full p-6 space-y-4 mt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pagamentos</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Pesquisar por membro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus | "ALL")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PAID">Pagos</SelectItem>
                <SelectItem value="PENDING">Pendentes</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Substitui os inputs de data por um sistema de filtro de período */}
            <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodFilter)}>
              <SelectTrigger className={`w-[180px] ${search ? "opacity-50" : ""}`} disabled={!!search}>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Mês atual</SelectItem>
                <SelectItem value="last_month">Mês passado</SelectItem>
                <SelectItem value="last_3_months">Últimos 3 meses</SelectItem>
                <SelectItem value="last_year">Últimos 12 meses</SelectItem>
                <SelectItem value="specific">Mês/ano específico</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Selects para mês/ano específico */}
            {periodFilter === "specific" && !search && (
              <div className="flex gap-2 items-center">
                <Select value={specificMonth} onValueChange={setSpecificMonth}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={String(month)}>
                        {getMonthName(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={specificYear} onValueChange={setSpecificYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 5 }, 
                      (_, i) => new Date().getFullYear() - 2 + i
                    ).map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => generateInvoiceForm.reset()}>
                Gerar Faturas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Gerar Faturas
                </DialogTitle>
                <DialogDescription>
                  Gere faturas para todos os membros ativos para o mês e ano selecionados.
                </DialogDescription>
              </DialogHeader>
              <Form {...generateInvoiceForm}>
                <form onSubmit={generateInvoiceForm.handleSubmit(handleGenerateInvoices)} className="space-y-4">
                  <div className="flex gap-2">
                    <FormField
                      control={generateInvoiceForm.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Mês</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o mês" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={String(month)}>
                                  {getMonthName(month)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generateInvoiceForm.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Ano</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o ano" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={generateInvoiceForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Valor</FormLabel>
                          <Input
                            type="text"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-full"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Gerando..." : "Gerar Faturas"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table className="border rounded">
        <TableHeader>
          <TableRow>
            <TableHead>Membro</TableHead>
            <TableHead>Mês/Ano</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Pagamento</TableHead>
            <TableHead className="w-[100px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.member.name}</TableCell>
              <TableCell>{getMonthName(payment.month)}/{payment.year}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>
                <Badge variant={payment.status === "PAID" ? "secondary" : "outline"}>
                  {payment.status === "PAID" ? "Pago" : "Pendente"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(payment.paidAt)}</TableCell>
              <TableCell className="flex items-center justify-end gap-4">
                {!payment.paidAt && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      toast.success("Pagamento pago com sucesso!")
                    }}
                  >
                    Pagar
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="cursor-pointer hover:text-red-500 transition-colors"
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza que deseja excluir este pagamento?</AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                        Esta ação apagará este pagamento de forma permanente e <span className="font-bold">IRRECUPERÁVEL</span>.<br /><br />
                        Todos os dados serão perdidos para <span className="font-bold">SEMPRE</span>. Não pode ser desfeita. Proceda apenas se tiver absoluta certeza.<br /><br />
                        <span className="font-bold">O dado de exclusão será salvo na aplicação</span> e poderá ser acessado pelos logs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        console.log("Delete payment", payment)
                        toast.success("Pagamento excluído com sucesso!")
                      }}>
                        Confirmar Exclusão
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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