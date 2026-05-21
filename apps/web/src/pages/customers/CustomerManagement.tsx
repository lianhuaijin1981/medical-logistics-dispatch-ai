import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerService from '../../services/customerService';
import type { Customer } from '@med/shared-types';
import { Loading } from '@med/ui-components';
import { cn } from '@med/shared-utils';

const TYPE_LABELS: Record<string, string> = {
  hospital: '医院',
  pharmacy: '药店',
  clinic: '诊所',
  distributor: '经销商',
  other: '其他',
};

const TYPE_COLORS: Record<string, string> = {
  hospital: 'text-red-600 bg-red-50',
  pharmacy: 'text-green-600 bg-green-50',
  clinic: 'text-blue-600 bg-blue-50',
  distributor: 'text-purple-600 bg-purple-50',
  other: 'text-gray-600 bg-gray-100',
};

const CREDIT_LABELS: string[] = ['D级（差）', 'C级（中）', 'B级（良）', 'A级（优）', 'A+级', 'AA级'];

const PAGE_SIZE = 10;

interface ContactForm {
  name: string;
  phone: string;
  role: string;
  isPrimary: boolean;
  email: string;
  wechat: string;
}

interface TagForm {
  label: string;
  color: string;
}

interface CustomerForm {
  name: string;
  code: string;
  type: string;
  address: { province: string; city: string; district: string; detail: string; postalCode?: string };
  contacts: ContactForm[];
  creditLevel: number;
  businessLicense?: { number: string; expiryDate: string; scope: string };
  qualityCert: { gsp: boolean; gmp: boolean; other: string[] };
  temperatureRequirements: string[];
  receivingWindow: { weekdays: number[]; startTime: string; endTime: string };
  tags: TagForm[];
  enabled: boolean;
  remark: string;
}

const weekdaysOptions = [
  { value: 0, label: '日' },
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '五' },
  { value: 6, label: '六' },
];

const initialForm = (): CustomerForm => ({
  name: '',
  code: '',
  type: 'hospital',
  address: { province: '', city: '', district: '', detail: '', postalCode: '' },
  contacts: [],
  creditLevel: 3,
  businessLicense: { number: '', expiryDate: '', scope: '' },
  qualityCert: { gsp: false, gmp: false, other: [] },
  temperatureRequirements: [],
  receivingWindow: { weekdays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
  tags: [],
  enabled: true,
  remark: '',
});

const CustomerManagement: React.FC = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(initialForm());
  const [contactForm, setContactForm] = useState<ContactForm>({ name: '', phone: '', role: '', isPrimary: false, email: '', wechat: '' });
  const [tagLabel, setTagLabel] = useState('');
  const [otherCert, setOtherCert] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, keyword, typeFilter],
    queryFn: () =>
      customerService.getList({
        page,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
        type: (typeFilter || undefined) as string | undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const customers: Customer[] = (data as any)?.items || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const createMut = useMutation({
    mutationFn: (dto: any) => customerService.create(dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); closeDrawer(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      customerService.update(id, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); closeDrawer(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const toggleEnabledMut = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      customerService.update(id, { enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const openCreate = () => { setEditing(null); setForm(initialForm()); setDrawerOpen(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name,
      code: c.code,
      type: c.type,
      address: { ...c.address },
      contacts: (c.contacts || []).map((ct: any) => ({ ...ct })),
      creditLevel: c.creditLevel ?? 3,
      businessLicense: c.businessLicense ? { ...c.businessLicense } : undefined,
      qualityCert: {
        gsp: c.qualityCert?.gsp ?? false,
        gmp: c.qualityCert?.gmp ?? false,
        other: [...(c.qualityCert?.other || [])],
      },
      temperatureRequirements: [...(c.temperatureRequirements || [])],
      receivingWindow: c.receivingWindow ? { ...c.receivingWindow } : { weekdays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' },
      tags: (c.tags || []).map((t: any) => ({ ...t })),
      enabled: c.enabled ?? true,
      remark: c.remark || '',
    });
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null); };

  const addContact = () => {
    if (!contactForm.name || !contactForm.phone) return;
    setForm((f) => ({ ...f, contacts: [...f.contacts, { ...contactForm }] }));
    setContactForm({ name: '', phone: '', role: '', isPrimary: false, email: '', wechat: '' });
  };

  const removeContact = (idx: number) => {
    setForm((f) => ({ ...f, contacts: f.contacts.filter((_: any, i: number) => i !== idx) }));
  };

  const addTag = () => {
    if (!tagLabel) return;
    setForm((f) => ({ ...f, tags: [...f.tags, { label: tagLabel, color: '' }] }));
    setTagLabel('');
  };

  const removeTag = (idx: number) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((_: any, i: number) => i !== idx) }));
  };

  const addOtherCert = () => {
    if (!otherCert) return;
    setForm((f) => ({ ...f, qualityCert: { ...f.qualityCert, other: [...f.qualityCert.other, otherCert] } }));
    setOtherCert('');
  };

  const removeOtherCert = (idx: number) => {
    setForm((f) => ({ ...f, qualityCert: { ...f.qualityCert, other: f.qualityCert.other.filter((_: string, i: number) => i !== idx) } }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.code) return;
    const dto: any = {
      name: form.name,
      code: form.code,
      type: form.type,
      address: form.address,
      contacts: form.contacts,
      creditLevel: form.creditLevel,
      businessLicense: form.businessLicense?.number ? form.businessLicense : undefined,
      qualityCert: {
        ...(form.qualityCert.gsp || form.qualityCert.gsp ? { gsp: form.qualityCert.gsp } : {}),
        ...(form.qualityCert.gsp || form.qualityCert.gsp ? { gmp: form.qualityCert.gsp } : {}),
        ...(form.qualityCert.other.length > 0 ? { other: form.qualityCert.other } : {}),
      },
      temperatureRequirements: form.temperatureRequirements.length > 0 ? form.temperatureRequirements : undefined,
      receivingWindow: form.receivingWindow ? form.receivingWindow : undefined,
      tags: form.tags.length > 0 ? form.tags : undefined,
      enabled: form.enabled,
      remark: form.remark || undefined,
    };
    if (editing) {
      updateMut.mutate({ id: editing._id, dto });
    } else {
      createMut.mutate(dto);
    }
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">客户管理</h1>
        <button onClick={openCreate} className="btn-primary">+ 新建客户</button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="搜索客户名称、编码..."
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          className="w-64 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as string | ''); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
        >
          <option value="">全部类型</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          onClick={() => { setKeyword(''); setTypeFilter(''); setPage(1); }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >重置筛选</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <Loading text="加载客户数据..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">客户名称</th>
                  <th className="px-4 py-3 font-medium">编码</th>
                  <th className="px-4 py-3 font-medium">类型</th>
                  <th className="px-4 py-3 font-medium">地址</th>
                  <th className="px-4 py-3 font-medium">信用等级</th>
                  <th className="px-4 py-3 font-medium text-center">状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">暂无客户数据</td></tr>
                )}
                {customers.map((c: Customer) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', TYPE_COLORS[c.type] || 'text-gray-600 bg-gray-100')}>
                        {TYPE_LABELS[c.type] || c.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{c.address?.city}{c.address?.district}</td>
                    <td className="px-4 py-3 text-xs">{CREDIT_LABELS[c.creditLevel] || `等级${c.creditLevel}`}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleEnabledMut.mutate({ id: c._id, enabled: !c.enabled })}
                        disabled={toggleEnabledMut.isPending}
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          c.enabled ? 'bg-primary-600' : 'bg-gray-300',
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                          c.enabled ? 'translate-x-4' : 'translate-x-0.5',
                        )} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(c)} className="text-xs text-gray-500 hover:text-primary-600">编辑</button>
                        <button
                          onClick={() => window.confirm('确认删除此客户？') && deleteMut.mutate(c._id)}
                          className="text-xs text-gray-500 hover:text-red-600"
                        >删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">共 {total} 条，第 {page}/{totalPages} 页</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">上一页</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50">下一页</button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={closeDrawer} />
          <div className="absolute right-0 top-0 bottom-0 w-[480px] bg-white shadow-xl flex flex-col z-50">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">{editing ? '编辑客户' : '新建客户'}</h3>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Basic info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户名称 <span className="text-red-500">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户编码 <span className="text-red-500">*</span></label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as string }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  >
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">信用等级</label>
                  <select
                    value={form.creditLevel}
                    onChange={(e) => setForm((f) => ({ ...f, creditLevel: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                  >
                    {CREDIT_LABELS.map((label, i) => (
                      <option key={i} value={i}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="border border-gray-100 rounded-lg p-3 space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">地址信息</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="省份"
                    value={form.address.province}
                    onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, province: e.target.value } }))}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded"
                  />
                  <input
                    placeholder="城市"
                    value={form.address.city}
                    onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, city: e.target.value } }))}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="区县"
                    value={form.address.district}
                    onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, district: e.target.value } }))}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded"
                  />
                  <input
                    placeholder="邮编"
                    value={form.address.postalCode}
                    onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, postalCode: e.target.value } }))}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded"
                  />
                </div>
                <input
                  placeholder="详细地址"
                  value={form.address.detail}
                  onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, detail: e.target.value } }))}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded"
                />
              </div>

              {/* Contacts */}
              <div className="border border-gray-100 rounded-lg p-3 space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">联系人</div>
                {(form.contacts || []).map((ct: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1.5">
                    <span className="font-medium">{ct.name}</span>
                    <span className="text-gray-400">{ct.role}</span>
                    <span className="font-mono">{ct.phone}</span>
                    {ct.isPrimary && <span className="text-primary-600 text-xs">主要</span>}
                    <button onClick={() => removeContact(idx)} className="text-red-400 hover:text-red-600 ml-auto">✕</button>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="姓名"
                    value={contactForm.name}
                    onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                    className="px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                  <input
                    placeholder="手机"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                    className="px-2 py-1 text-xs border border-gray-200 rounded font-mono"
                  />
                  <input
                    placeholder="职位"
                    value={contactForm.role}
                    onChange={(e) => setContactForm((f) => ({ ...f, role: e.target.value }))}
                    className="px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    placeholder="邮箱"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                  <input
                    placeholder="微信"
                    value={contactForm.wechat}
                    onChange={(e) => setContactForm((f) => ({ ...f, wechat: e.target.value }))}
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={contactForm.isPrimary}
                      onChange={(e) => setContactForm((f) => ({ ...f, isPrimary: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    主要
                  </label>
                  <button onClick={addContact} className="text-xs text-primary-600 hover:text-primary-700">添加</button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(form.tags || []).map((t: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary-50 text-primary-700">
                      {t.label}
                      <button onClick={() => removeTag(idx)} className="hover:text-primary-900">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    placeholder="输入标签后回车"
                    value={tagLabel}
                    onChange={(e) => setTagLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                  <button onClick={addTag} className="text-xs text-primary-600">添加</button>
                </div>
              </div>

              {/* Receiving window */}
              <div className="border border-gray-100 rounded-lg p-3 space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">收货窗口</div>
                <div className="flex gap-1 flex-wrap">
                  {weekdaysOptions.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => {
                        const wd = form.receivingWindow?.weekdays || [];
                        const next = wd.includes(d.value) ? wd.filter((x: number) => x !== d.value) : [...wd, d.value];
                        setForm((f) => ({ ...f, receivingWindow: { ...f.receivingWindow!, weekdays: next, startTime: f.receivingWindow?.startTime || '09:00', endTime: f.receivingWindow?.endTime || '17:00' } }));
                      }}
                      className={cn(
                        'w-7 h-7 rounded-full text-xs border transition-colors',
                        (form.receivingWindow?.weekdays || []).includes(d.value)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300',
                      )}
                    >{d.label}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">开始时间</label>
                    <input
                      type="time"
                      value={form.receivingWindow?.startTime || '09:00'}
                      onChange={(e) => setForm((f) => ({ ...f, receivingWindow: { ...f.receivingWindow!, startTime: e.target.value, endTime: f.receivingWindow?.endTime || '17:00', weekdays: f.receivingWindow?.weekdays || [1, 2, 3, 4, 5] } }))}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">结束时间</label>
                    <input
                      type="time"
                      value={form.receivingWindow?.endTime || '17:00'}
                      onChange={(e) => setForm((f) => ({ ...f, receivingWindow: { ...f.receivingWindow!, endTime: e.target.value, startTime: f.receivingWindow?.startTime || '09:00', weekdays: f.receivingWindow?.weekdays || [1, 2, 3, 4, 5] } }))}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={form.remark}
                  onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-400 resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={closeDrawer} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">取消</button>
              <button
                onClick={handleSubmit}
                disabled={!form.name || !form.code || isMutating}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >{isMutating ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
