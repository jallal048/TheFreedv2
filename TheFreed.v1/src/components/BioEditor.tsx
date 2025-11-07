// BioEditor - Editor de texto rico con formato, hashtags y menciones
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Bold, 
  Italic, 
  Link, 
  Hash, 
  AtSign, 
  Eye, 
  Edit3, 
  Save, 
  X,
  Type,
  ExternalLink
} from 'lucide-react';

interface FormattedText {
  text: string;
  type: 'bold' | 'italic' | 'link' | 'hashtag' | 'mention' | 'normal';
  url?: string;
  href?: string;
}

interface BioEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const BioEditor: React.FC<BioEditorProps> = ({
  value,
  onChange,
  placeholder = "Escribe tu biografía...",
  maxLength = 500,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Detectar entidades especiales en el texto
  const parseFormattedText = (text: string): FormattedText[] => {
    if (!text) return [];
    
    const words = text.split(' ');
    const formattedWords: FormattedText[] = [];
    
    words.forEach((word, index) => {
      let formattedWord: FormattedText = { text: word, type: 'normal' };
      
      // Detectar hashtags
      if (word.startsWith('#') && word.length > 1) {
        formattedWord = {
          text: word,
          type: 'hashtag',
          url: `/hashtag/${word.substring(1)}`
        };
      }
      // Detectar menciones
      else if (word.startsWith('@') && word.length > 1) {
        formattedWord = {
          text: word,
          type: 'mention',
          url: `/user/${word.substring(1)}`
        };
      }
      // Detectar URLs
      else if (word.startsWith('http://') || word.startsWith('https://')) {
        formattedWord = {
          text: word,
          type: 'link',
          url: word,
          href: word
        };
      }
      // Detectar enlaces simples (sin http)
      else if (word.includes('.') && !word.includes(' ')) {
        formattedWord = {
          text: word,
          type: 'link',
          url: `https://${word}`,
          href: `https://${word}`
        };
      }
      
      formattedWords.push(formattedWord);
      
      // Agregar espacio si no es la última palabra
      if (index < words.length - 1) {
        formattedWords.push({ text: ' ', type: 'normal' });
      }
    });
    
    return formattedWords;
  };

  const formattedText = useMemo(() => {
    return parseFormattedText(localValue);
  }, [localValue]);

  const remainingChars = maxLength - localValue.length;
  const isOverLimit = remainingChars < 0;

  // Renderizar texto con formato
  const renderFormattedText = (formattedText: FormattedText[]) => {
    return formattedText.map((item, index) => {
      switch (item.type) {
        case 'bold':
          return (
            <strong key={index} className="font-bold">
              {item.text}
            </strong>
          );
        case 'italic':
          return (
            <em key={index} className="italic">
              {item.text}
            </em>
          );
        case 'hashtag':
          return (
            <a
              key={index}
              href={item.url}
              className="text-primary hover:underline font-medium"
            >
              {item.text}
            </a>
          );
        case 'mention':
          return (
            <a
              key={index}
              href={item.url}
              className="text-blue-600 hover:underline font-medium"
            >
              {item.text}
            </a>
          );
        case 'link':
          return (
            <a
              key={index}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {item.text}
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        default:
          return (
            <span key={index}>
              {item.text}
            </span>
          );
      }
    });
  };

  // Insertar texto formateado
  const insertFormattedText = (type: 'bold' | 'italic' | 'link') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = localValue.substring(start, end) || 'texto';
    
    let formattedText = '';
    
    switch (type) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'link':
        formattedText = `[${selectedText}](https://)`;
        break;
    }
    
    const newValue = 
      localValue.substring(0, start) + 
      formattedText + 
      localValue.substring(end);
    
    setLocalValue(newValue);
    onChange(newValue);
    
    // Restaurar foco y posición
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + (type === 'bold' || type === 'italic' ? 2 : 0),
        start + formattedText.length - (type === 'bold' || type === 'italic' ? 2 : 0)
      );
    }, 0);
  };

  // Insertar hashtag o mención
  const insertSpecialText = (type: 'hashtag' | 'mention') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const prefix = type === 'hashtag' ? '#' : '@';
    
    const newValue = 
      localValue.substring(0, start) + 
      prefix + 
      localValue.substring(start);
    
    setLocalValue(newValue);
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  // Funciones de guardado
  const handleSave = () => {
    onChange(localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  // Estadísticas del texto
  const textStats = useMemo(() => {
    const words = localValue.trim().split(/\s+/).filter(word => word.length > 0);
    const hashtags = (localValue.match(/#\w+/g) || []).length;
    const mentions = (localValue.match(/@\w+/g) || []).length;
    const links = (localValue.match(/https?:\/\/[^\s]+/g) || []).length;
    const mentionsPlain = (localValue.match(/(?<!\w)@[\w.-]+/g) || []).length;
    
    return {
      words: words.length,
      characters: localValue.length,
      hashtags,
      mentions: mentions + mentionsPlain,
      links,
      paragraphs: localValue.split('\n').filter(p => p.trim().length > 0).length
    };
  }, [localValue]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Biografía con Formato
          </CardTitle>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreview(!isPreview)}
                >
                  {isPreview ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {isPreview ? 'Editar' : 'Vista Previa'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isOverLimit}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isEditing ? (
          // Vista de solo lectura
          <div className="min-h-[100px] p-4 border rounded-lg bg-gray-50">
            {localValue ? (
              <div className="text-gray-900 leading-relaxed">
                {renderFormattedText(formattedText)}
              </div>
            ) : (
              <p className="text-gray-500 italic">{placeholder}</p>
            )}
          </div>
        ) : (
          // Modo de edición
          <div className="space-y-3">
            {/* Barra de herramientas */}
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertFormattedText('bold')}
                title="Negrita"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertFormattedText('italic')}
                title="Cursiva"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertFormattedText('link')}
                title="Enlace"
              >
                <Link className="h-4 w-4" />
              </Button>
              <div className="w-px bg-gray-300 mx-1"></div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertSpecialText('hashtag')}
                title="Hashtag"
              >
                <Hash className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insertSpecialText('mention')}
                title="Mención"
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </div>

            {/* Editor de texto */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={localValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={4}
                className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  isOverLimit ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                style={{ minHeight: '100px' }}
              />
              
              {/* Contador de caracteres */}
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                <span className={isOverLimit ? 'text-red-600 font-medium' : ''}>
                  {Math.abs(remainingChars)}
                </span>
                /{maxLength}
              </div>
            </div>

            {/* Alertas */}
            {isOverLimit && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  Has excedido el límite de {maxLength} caracteres. 
                  Reduce el texto para poder guardar.
                </AlertDescription>
              </Alert>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="font-medium text-blue-900">{textStats.words}</p>
                <p className="text-blue-600">palabras</p>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="font-medium text-green-900">{textStats.hashtags}</p>
                <p className="text-green-600">hashtags</p>
              </div>
              <div className="bg-purple-50 p-2 rounded text-center">
                <p className="font-medium text-purple-900">{textStats.mentions}</p>
                <p className="text-purple-600">menciones</p>
              </div>
            </div>

            {/* Vista previa integrada */}
            {isPreview && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Vista Previa:</h4>
                <div className="min-h-[80px] p-4 border rounded-lg bg-white">
                  {localValue ? (
                    <div className="text-gray-900 leading-relaxed">
                      {renderFormattedText(formattedText)}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Vista previa vacía</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Información de ayuda */}
        {!isEditing && (
          <Alert>
            <Hash className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Consejos:</strong> Usa #hashtags para categorizar, @menciones para referenciar otros usuarios, 
              y enlaces para tu sitio web. El texto se formateará automáticamente.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BioEditor;
