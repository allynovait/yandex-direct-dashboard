
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
import { useState } from "react";

interface DateRangePickerProps {
  date: DateRange;
  onDateChange: (date: DateRange) => void;
}

export function DateRangePicker({ date, onDateChange }: DateRangePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Функция для обработки изменения диапазона дат
  const handleRangeSelect = (selectedRange: { from?: Date; to?: Date }) => {
    if (selectedRange.from) {
      // Если выбрана только начальная дата
      if (!selectedRange.to) {
        onDateChange({ from: selectedRange.from, to: date.to || new Date() });
      } else {
        // Если выбран полный диапазон
        onDateChange({ from: selectedRange.from, to: selectedRange.to });
        // Закрываем календарь после выбора полного диапазона
        setIsCalendarOpen(false);
      }
    }
  };

  return (
    <div className="grid gap-2">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={{ from: date?.from, to: date?.to }}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              locale={ru}
              className="pointer-events-auto"
              showOutsideDays={false}
            />
            <div className="mt-3 flex justify-end">
              <Button 
                size="sm" 
                onClick={() => setIsCalendarOpen(false)}
                className="mr-2"
                variant="outline"
              >
                Отмена
              </Button>
              <Button 
                size="sm" 
                onClick={() => setIsCalendarOpen(false)}
              >
                Применить
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
