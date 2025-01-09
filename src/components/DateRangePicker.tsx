import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "@/types/yandex";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface DateRangePickerProps {
  date: DateRange;
  onDateChange: (date: DateRange) => void;
}

export function DateRangePicker({ date, onDateChange }: DateRangePickerProps) {
  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d MMMM yyyy", { locale: ru })} -{" "}
                  {format(date.to, "d MMMM yyyy", { locale: ru })}
                </>
              ) : (
                format(date.from, "d MMMM yyyy", { locale: ru })
              )
            ) : (
              <span>Выберите период</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={{ from: date?.from, to: date?.to }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateChange({ from: range.from, to: range.to });
              }
            }}
            numberOfMonths={2}
            locale={ru}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}