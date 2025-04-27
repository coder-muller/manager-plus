"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Member } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const memberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().optional().refine((email) => {
    if (!email) return true
    return z.string().email("Email inválido").safeParse(email).success
  }, {
    message: "Email inválido",
  }),
  phone: z.string().optional().refine((phone) => {
    if (!phone) return true
    return z.string().min(8, "Telefone deve ter no mínimo 8 dígitos").safeParse(phone).success
  }, {
    message: "Telefone inválido",
  }),
  address: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"] as const),
})

type MemberFormValues = z.infer<typeof memberSchema>

interface MemberFormProps {
  member: Member | null
  onSubmit: (data: MemberFormValues) => void
  onDelete: () => void
  isLoading: boolean
  isDeleting: boolean
}

export function MemberForm({ member, onSubmit, onDelete, isLoading, isDeleting }: MemberFormProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member?.name ?? "",
      email: member?.email ?? "",
      phone: member?.phone ?? "",
      address: member?.address ?? "",
      status: member?.status ?? "ACTIVE",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
          {member && (
            <Button variant="destructive" type="button" onClick={onDelete} disabled={isLoading || isDeleting}>
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
              member ? "Salvar" : "Criar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 