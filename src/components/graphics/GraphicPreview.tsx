import { useRef, useState } from 'react';
import { Download, Edit2, Upload, X, Check } from 'lucide-react';
import { renderGraphic, FORMAT_DIMENSIONS, type GraphicFormat, type TemplateStyle, type GraphicData } from './templates';
import { downloadWithWatermark } from '../../lib/watermark';

interface GraphicPreviewProps {
  format: GraphicFormat;
  style: TemplateStyle;
  data: GraphicData;
  caption?: string;
  userPlan?: string | null;
  onCaptionEdit?: (newCaption: string) => void;
  onImageUpload?: (imageUrl: string) => void;
  onGraphicTextEdit?: (field: string, value: string) => void;
}

export default function GraphicPreview({
  format,
  style,
  data,
  caption,
  userPlan,
  onCaptionEdit,
  onImageUpload,
  onGraphicTextEdit,
}: GraphicPreviewProps) {
  const graphicRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(caption || '');
  const [editingGraphic, setEditingGraphic] = useState(false);

  const dims = FORMAT_DIMENSIONS[format];
  const html = renderGraphic(format, style, data);

  // Scale down for preview
  const previewWidth = 360;
  const scale = previewWidth / dims.width;
  const previewHeight = dims.height * scale;

  const handleDownload = async () => {
    if (!graphicRef.current) return;
    setDownloading(true);

    try {
      await downloadWithWatermark(
        graphicRef.current,
        `${data.businessName.replace(/\s+/g, '-').toLowerCase()}-${format}-${Date.now()}.png`,
        userPlan,
        { width: dims.width, height: dims.height, pixelRatio: 1 }
      );
    } catch (err) {
      console.error('Download failed:', err);
    }
    setDownloading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      onImageUpload?.(url);
    };
    reader.readAsDataURL(file);
  };

  const saveCaption = () => {
    onCaptionEdit?.(editedCaption);
    setEditingCaption(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Graphic preview */}
      <div className="relative bg-gray-50 flex items-center justify-center p-4" style={{ minHeight: previewHeight + 32 }}>
        <div
          style={{
            width: previewWidth,
            height: previewHeight,
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}
        >
          {/* Scaled preview */}
          <div
            style={{
              width: dims.width,
              height: dims.height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        {/* Hidden full-size render for download */}
        <div
          ref={graphicRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: 0,
            width: dims.width,
            height: dims.height,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Format badge */}
        <div className="absolute top-6 right-6 px-2.5 py-1 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
          {dims.label}
        </div>
      </div>

      {/* Upload image button */}
      {onImageUpload && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-500 hover:text-brand-blue hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            {data.userImageUrl ? 'Change Image' : 'Add Your Image'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      )}

      {/* Edit graphic text panel */}
      {editingGraphic && onGraphicTextEdit && (
        <div className="px-4 py-4 border-t border-gray-100 space-y-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Edit Graphic Text</span>
            <button onClick={() => setEditingGraphic(false)} className="text-xs text-brand-blue font-semibold hover:underline">Done</button>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Headline</label>
            <input
              type="text"
              value={data.headline}
              onChange={(e) => onGraphicTextEdit('headline', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>
          {data.body !== undefined && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Body Text</label>
              <input
                type="text"
                value={data.body || ''}
                onChange={(e) => onGraphicTextEdit('body', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          )}
          {data.cta !== undefined && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">CTA Button</label>
              <input
                type="text"
                value={data.cta || ''}
                onChange={(e) => onGraphicTextEdit('cta', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>
          )}
        </div>
      )}

      {/* Caption */}
      {caption !== undefined && (
        <div className="px-4 py-3 border-t border-gray-100">
          {editingCaption ? (
            <div className="space-y-2">
              <textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 resize-none min-h-[80px]"
              />
              <div className="flex gap-2">
                <button onClick={saveCaption} className="inline-flex items-center gap-1 text-xs font-medium text-white bg-brand-blue px-3 py-1.5 rounded-lg hover:bg-brand-blue/90">
                  <Check className="w-3 h-3" /> Save
                </button>
                <button onClick={() => setEditingCaption(false)} className="text-xs font-medium text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed line-clamp-4">{caption}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-brand-blue rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Saving...' : 'Download PNG'}
        </button>
        {(onGraphicTextEdit || onCaptionEdit) && (
          <button
            onClick={() => {
              if (onGraphicTextEdit) setEditingGraphic(!editingGraphic);
              if (onCaptionEdit && !onGraphicTextEdit) { setEditedCaption(caption || ''); setEditingCaption(true); }
            }}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-4 text-sm font-medium border rounded-lg transition-colors ${editingGraphic || editingCaption ? 'bg-brand-blue text-white border-brand-blue' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        )}
        {onCaptionEdit && onGraphicTextEdit && !editingGraphic && (
          <button
            onClick={() => { setEditedCaption(caption || ''); setEditingCaption(!editingCaption); }}
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium border rounded-lg transition-colors ${editingCaption ? 'bg-brand-blue text-white border-brand-blue' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
          >
            Caption
          </button>
        )}
      </div>
    </div>
  );
}
