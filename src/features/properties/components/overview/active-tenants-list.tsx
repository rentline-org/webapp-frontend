import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { Edit2, FileText, Mail, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'

const ActiveTenantsList = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenants</CardTitle>
        <CardDescription>
          Tenant profiles and occupancy details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          <Item variant='muted'>
            <ItemContent>
              <ItemTitle>James Orion</ItemTitle>
              <ItemDescription>Lease ends: 12/31/2024</ItemDescription>
              <div>
                <span>Lease status:</span>
                <Badge variant='success' className='ml-2'>
                  Active
                </Badge>
              </div>
            </ItemContent>
            <ItemActions>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <span className='sr-only'>Open actions</span>
                    <DotsVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>
                    <Edit2 className='me-2 size-4' />
                    Edit tenant
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className='me-2 size-4' />
                    View profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className='me-2 size-4' />
                    Send email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className='me-2 size-4' />
                    Manage lease
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ItemActions>
          </Item>
        </ItemGroup>
      </CardContent>
    </Card>
  )
}

export default ActiveTenantsList
