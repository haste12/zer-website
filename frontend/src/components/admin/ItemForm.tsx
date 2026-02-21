'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';
import AdminGuard from '@/components/admin/AdminGuard';
import { api, formatIQD, formatNumber, getImageUrl, CATEGORY_LABELS } from '@/lib/api';
import type { GoldPrice, Item } from '@/types';
import toast from 'react-hot-toast';
import { FiUpload, FiX, FiSave, FiArrowLeft, FiInfo } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';
import Link from 'next/link';
import clsx from 'clsx';
import AnimatedNumber from '@/components/AnimatedNumber';

const goldPriceFetcher = (url: string) => api.get(url).then((r) => r.data.data);

interface ItemFormProps {
  item?: Item;
  isEditing?: boolean;
}

export default function ItemForm({ item, isEditing = false }: ItemFormProps) {
  const router = useRouter();
  const { data: goldPrice } = useSWR<GoldPrice>('/gold-price', goldPriceFetcher);

  const [form, setForm] = useState({
    name: item?.name || '',
    nameAr: item?.nameAr || '',
    description: item?.description || '',
    weight: item?.weight?.toString() || '',
    karat: item?.karat || '21K',
    category: item?.category || 'ring',
    profitMargin: item?.profitMargin?.toString() || '0',
    isAvailable: item?.isAvailable !== false,
    isFeatured: item?.isFeatured || false,
    sku: item?.sku || '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => [...prev, url]);
    });
  };

  const removeNewImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // Live price preview
  const calculatePreviewPrice = (): number => {
    if (!goldPrice || !form.weight || !form.karat) return 0;
    const priceKey = `price${form.karat}` as keyof GoldPrice;
    const pricePerMithqal = (goldPrice[priceKey] as number) || 0;
    return Math.round(pricePerMithqal * parseFloat(form.weight) + parseFloat(form.profitMargin || '0'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.weight || !form.karat) {
      toast.error('تکایە هەموو خانە پێویستەکان دەبژێنەوە');
      return;
    }

    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    images.forEach((img) => fd.append('images', img));

    try {
      if (isEditing && item) {
        await api.put(`/items/${item._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('کاڵا بە سەرکەوتوویی نوێکرایەوە');
      } else {
        await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('کاڵا بە سەرکەوتوویی دروستکرای');
      }
      router.push('/admin/items');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'پاشەکەوتکردنی کاڵا بوونەژووەر');
    } finally {
      setSaving(false);
    }
  };

  const previewPrice = calculatePreviewPrice();
  const karats = ['18K', '21K', '22K', '24K'] as const;
  const categories = Object.entries(CATEGORY_LABELS);

  return (
    <AdminGuard>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/items" className="btn-ghost px-3 py-2">
            <FiArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              {isEditing ? 'چاککەردنی کاڵا' : 'زیادکردنی کاڵای نوێ'}
            </h1>
            <p className="text-gray-500 text-sm">{isEditing ? `چاککەردن: ${item?.name}` : 'کاڵای زێڕییی نوێی زیادبکە بۆ فرۆشگاکەت'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-5">
              {/* Basic info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-4">زانیاریی بنەڕەتی</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ناوی کاڵا <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="نمونە: گۆزەری زێڕیی کلاسیکی"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ناوی عەرەبی (خیارزینە)
                    </label>
                    <input
                      name="nameAr"
                      value={form.nameAr}
                      onChange={handleChange}
                      placeholder="e.g. خاتم ذهب كلاسيك"
                      className="input-field"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">وەسف</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="وەسفی کاڵاکەت بنوسە..."
                      className="input-field resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">کۆدی کاڵا (خیارزینە)</label>
                    <input
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      placeholder="e.g. RNG-001"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Gold Details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <GiGoldBar className="text-gold-600" />
                  دەتایی زێڕ و نرخ
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      کێشە (مەثقاڵ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="weight"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.weight}
                      onChange={handleChange}
                      placeholder="نمونە: 2.5"
                      className="input-field"
                      required
                    />
                    {form.weight && (
                      <p className="text-xs text-gray-400 mt-1">
                        ≈ {(parseFloat(form.weight) * 4.608).toFixed(3)} گرام
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      کارات <span className="text-red-500">*</span>
                    </label>
                    <select name="karat" value={form.karat} onChange={handleChange} className="input-field">
                      {karats.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">جۆر</label>
                    <select name="category" value={form.category} onChange={handleChange} className="input-field">
                      {categories.map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      زیادەکاری / کارسازی (IQD)
                    </label>
                    <input
                      name="profitMargin"
                      type="number"
                      step="1000"
                      min="0"
                      value={form.profitMargin}
                      onChange={handleChange}
                      placeholder="0"
                      className="input-field"
                    />
                    <p className="text-xs text-gray-400 mt-1">زیادبھێجەکی بە سەری نرخی بازاڕ</p>
                  </div>
                </div>

                {/* Live price preview */}
                {previewPrice > 0 && (
                  <div className="mt-4 bg-[#0d0a04] rounded-xl p-4 flex items-center gap-3">
                    <FiInfo className="text-gold-400 shrink-0" />
                    <div>
                      <p className="text-gold-400 text-xs font-medium">نرخی حیسابکراو</p>
                      <p className="text-white font-bold text-xl">
                        <AnimatedNumber value={previewPrice} asIQD duration={600} />
                      </p>
                      {goldPrice && (
                        <p className="text-white/40 text-xs">
                          <AnimatedNumber value={(goldPrice as any)[`price${form.karat}`]} duration={600} />
                          {' × '}{form.weight} مسقاڵ
                          {parseFloat(form.profitMargin) > 0 && (
                            <> + <AnimatedNumber value={parseFloat(form.profitMargin)} suffix=" کارسازی" duration={600} /></>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-4">وێنەییەکان</h2>

                {/* Existing images */}
                {isEditing && item?.images && item.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">وێنەییە کانی ھەندێکەکان:</p>
                    <div className="flex flex-wrap gap-3">
                      {item.images.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                          <Image src={getImageUrl(img.url)} alt={img.alt} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New images upload */}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gold-300 rounded-xl cursor-pointer hover:bg-gold-50 transition-colors">
                  <FiUpload className="text-gold-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-500">کلیک بکە بۆ بارکردنی وێنەیی</p>
                  <p className="text-xs text-gray-400">JPEG, PNG, WebP · كەمتری 5MB</p>
                  <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                </label>

                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                        <Image src={src} alt="preview" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: visibility & save */}
            <div className="space-y-5">
              {/* Visibility */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="font-semibold text-gray-800 mb-4">بەبینرایی</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={form.isAvailable}
                      onChange={handleChange}
                      className="w-4 h-4 text-gold-600 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">بەردەست بۆ کرێنەرەکان</p>
                      <p className="text-xs text-gray-400">ئەم کاڵا بۆ كرێنەرەکان نیشان بدەھێ</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                      className="w-4 h-4 text-gold-600 rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-700">کاڵای تایبەتمەند</p>
                      <p className="text-xs text-gray-400">لە روپێکەی سەرەکیدا نیشان بدەھێ</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Market price reference */}
              {goldPrice && (
                <div className="bg-gold-50 border border-gold-100 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gold-700 uppercase tracking-wide mb-2">
                    نرخی بازاڕ (د.ع/مەثقاڵ)
                  </p>
                  {(['18K', '21K', '22K', '24K'] as const).map((k) => (
                    <div key={k} className={clsx('flex justify-between text-sm py-1', form.karat === k && 'font-bold text-gold-800')}>
                      <span className={clsx('text-gold-700', form.karat === k && 'font-bold')}>{k}</span>
                      <AnimatedNumber value={(goldPrice as any)[`price${k}`]} duration={600} />
                    </div>
                  ))}
                </div>
              )}

              {/* Save button */}
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full justify-center py-3.5 text-base"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    پاشەکەوتکرەی...
                  </>
                ) : (
                  <>
                    <FiSave />
                    {isEditing ? 'گۆڕایییەکان پاشەکەوتبکە' : 'دروستكردنی کاڵا'}
                  </>
                )}
              </button>

              <Link href="/admin/items" className="btn-ghost w-full justify-center border border-gray-200">
                هەڵووشتن
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
