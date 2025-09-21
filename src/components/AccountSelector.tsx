import { useState } from 'react';
import { Check, ChevronsUpDown, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AccountSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function AccountSelector({ 
  value, 
  onValueChange, 
  placeholder = "Select ordering context...",
  className 
}: AccountSelectorProps) {
  const [open, setOpen] = useState(false);
  const { accounts, getAccountsWhereCanPlaceOrders, loading } = useAccounts();
  const { profile } = useAuth();

  const orderingAccounts = getAccountsWhereCanPlaceOrders();
  
  const options = [
    {
      value: 'individual',
      label: profile?.full_name || profile?.email || 'Individual Order',
      type: 'individual' as const,
      icon: User,
    },
    ...orderingAccounts.map(account => ({
      value: account.id,
      label: `${account.name} (${account.account_number})`,
      type: 'account' as const,
      icon: Building2,
    })),
  ];

  const selectedOption = options.find(option => option.value === value);

  if (loading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="h-10 w-[200px] bg-muted rounded-md" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[300px] justify-between", className)}
        >
          <div className="flex items-center">
            {selectedOption ? (
              <>
                <selectedOption.icon className="mr-2 h-4 w-4 shrink-0" />
                {selectedOption.label}
              </>
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search accounts..." />
          <CommandList>
            <CommandEmpty>No accounts found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onValueChange(option.value === value ? '' : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <option.icon className="mr-2 h-4 w-4 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.type === 'individual' ? 'Personal order' : 'Account order'}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}