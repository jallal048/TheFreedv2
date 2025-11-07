import React, { useState } from 'react';
import { format, addDays, addHours, startOfHour } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, X } from 'lucide-react';

interface SchedulePublicationProps {
  onSchedule: (scheduledFor: Date) => void;
  onCancel: () => void;
  minDate?: Date;
}

export const SchedulePublication: React.FC<SchedulePublicationProps> = ({
  onSchedule,
  onCancel,
  minDate = new Date()
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    format(addHours(startOfHour(new Date()), 1), "yyyy-MM-dd")
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    format(addHours(startOfHour(new Date()), 1), "HH:mm")
  );

  const handleSchedule = () => {
    const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    if (scheduledDateTime <= new Date()) {
      alert('La fecha y hora debe ser futura');
      return;
    }
    
    onSchedule(scheduledDateTime);
  };

  const quickOptions = [
    { label: '1 hora', hours: 1 },
    { label: '3 horas', hours: 3 },
    { label: '6 horas', hours: 6 },
    { label: '12 horas', hours: 12 },
    { label: '1 día', hours: 24 },
    { label: '3 días', hours: 72 },
    { label: '1 semana', hours: 168 }
  ];

  const handleQuickSelect = (hours: number) => {
    const futureDate = addHours(new Date(), hours);
    setSelectedDate(format(futureDate, "yyyy-MM-dd"));
    setSelectedTime(format(futureDate, "HH:mm"));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Programar Publicación</span>
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Opciones rápidas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opciones Rápidas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quickOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => handleQuickSelect(option.hours)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={format(minDate, "yyyy-MM-dd")}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selector de hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Vista previa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Se publicará:</span>{' '}
            {format(new Date(`${selectedDate}T${selectedTime}`), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleSchedule}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Confirmar Programación
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePublication;
