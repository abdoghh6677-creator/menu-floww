'use client'
import { useState } from 'react'

export default function BillSplitter({ totalAmount, deliveryFee, onSplitConfirm, restaurantName = '', items = [] }) {
  const [participants, setParticipants] = useState([
    { id: 1, name: '', phone: '', amount: 0, percentage: 100, selectedItems: [] }
  ])
  const [splitMethod, setSplitMethod] = useState('equal') // equal, custom, percentage, itemBased

  const addParticipant = () => {
    const newId = participants.length + 1
    setParticipants([
      ...participants,
      { id: newId, name: '', phone: '', amount: 0, percentage: 0, selectedItems: [] }
    ])
    
    if (splitMethod === 'equal') {
      redistributeEqually([...participants, { id: newId, name: '', phone: '', amount: 0, percentage: 0, selectedItems: [] }])
    }
  }

  const removeParticipant = (id) => {
    if (participants.length <= 1) return
    const updated = participants.filter(p => p.id !== id)
    setParticipants(updated)
    
    if (splitMethod === 'equal') {
      redistributeEqually(updated)
    }
  }

  const redistributeEqually = (parts = participants) => {
    const total = totalAmount + deliveryFee
    const perPerson = total / parts.length
    const updated = parts.map(p => ({
      ...p,
      amount: parseFloat(perPerson.toFixed(2)),
      percentage: parseFloat((100 / parts.length).toFixed(2))
    }))
    setParticipants(updated)
  }

  const updateParticipant = (id, field, value) => {
    const updated = participants.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value }
      }
      return p
    })
    setParticipants(updated)
  }

  // إضافة/إزالة عناصر لشخص معين (تقسيم بناءً على العناصر المختارة)
  const toggleItemForParticipant = (participantId, itemId) => {
    const updated = participants.map(p => {
      if (p.id === participantId) {
        const itemIndex = p.selectedItems.findIndex(si => si.id === itemId)
        if (itemIndex > -1) {
          // إزالة العنصر
          return {
            ...p,
            selectedItems: p.selectedItems.filter(si => si.id !== itemId)
          }
        } else {
          // إضافة العنصر
          const item = items.find(it => it.id === itemId)
          return {
            ...p,
            selectedItems: [...p.selectedItems, { id: itemId, name: item?.name || '', price: item?.price || 0 }]
          }
        }
      }
      return p
    })
    setParticipants(updated)
    
    // إعادة حساب التقسيم بناءً على العناصر المختارة
    if (splitMethod === 'itemBased') {
      recalculateItemBasedSplit(updated)
    }
  }

  const recalculateItemBasedSplit = (parts = participants) => {
    const updated = parts.map(p => {
      const itemsTotal = p.selectedItems.reduce((sum, item) => sum + (item.price || 0), 0)
      return {
        ...p,
        amount: itemsTotal,
        percentage: 0
      }
    })
    setParticipants(updated)
  }

  const updateAmount = (id, amount) => {
    const total = totalAmount + deliveryFee
    const updated = participants.map(p => {
      if (p.id === id) {
        const percentage = (parseFloat(amount) / total) * 100
        return { ...p, amount: parseFloat(amount), percentage: parseFloat(percentage.toFixed(2)) }
      }
      return p
    })
    setParticipants(updated)
  }

  const updatePercentage = (id, percentage) => {
    const total = totalAmount + deliveryFee
    const updated = participants.map(p => {
      if (p.id === id) {
        const amount = (parseFloat(percentage) / 100) * total
        return { ...p, percentage: parseFloat(percentage), amount: parseFloat(amount.toFixed(2)) }
      }
      return p
    })
    setParticipants(updated)
  }

  const handleSplitMethodChange = (method) => {
    setSplitMethod(method)
    if (method === 'equal') {
      redistributeEqually()
    } else if (method === 'itemBased') {
      recalculateItemBasedSplit()
    }
  }

  const getTotalSplit = () => {
    return participants.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  }

  const getRemaining = () => {
    const total = totalAmount + deliveryFee
    return total - getTotalSplit()
  }

  const isValid = () => {
    const allHaveNames = participants.every(p => p.name.trim() !== '')
    const totalMatches = Math.abs(getRemaining()) < 0.01
    return allHaveNames && totalMatches
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-2">تقسيم الفاتورة 💰</h3>
        <div className="flex justify-between items-center">
          <span>الإجمالي:</span>
          <span className="text-3xl font-bold">{(totalAmount + deliveryFee).toFixed(2)} ج</span>
        </div>
      </div>

      {/* طريقة التقسيم */}
      <div>
        <label className="block font-medium mb-3">طريقة التقسيم:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleSplitMethodChange('equal')}
            className={`py-3 rounded-lg font-semibold border-2 transition text-sm ${
              splitMethod === 'equal'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
            }`}
          >
            متساوي ⚖️
          </button>
          <button
            type="button"
            onClick={() => handleSplitMethodChange('custom')}
            className={`py-3 rounded-lg font-semibold border-2 transition text-sm ${
              splitMethod === 'custom'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
            }`}
          >
            مبلغ محدد 💵
          </button>
          <button
            type="button"
            onClick={() => handleSplitMethodChange('percentage')}
            className={`py-3 rounded-lg font-semibold border-2 transition text-sm ${
              splitMethod === 'percentage'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
            }`}
          >
            نسبة مئوية %
          </button>
          <button
            type="button"
            onClick={() => handleSplitMethodChange('itemBased')}
            className={`py-3 rounded-lg font-semibold border-2 transition text-sm ${
              splitMethod === 'itemBased'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
            }`}
          >
            حسب الطلبات 🍽️
          </button>
        </div>
      </div>

      {/* عرض العناصر المتاحة عند اختيار "حسب الطلبات" */}
      {splitMethod === 'itemBased' && items.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h4 className="font-bold mb-3">📋 العناصر المتاحة:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {items.map(item => (
              <div key={item.id} className="flex items-center p-2 bg-white rounded-lg border border-blue-100">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-blue-600 text-xs">{item.price?.toFixed(2)} ج</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">💡 اختر العناصر لكل شخص أدناه</p>
        </div>
      )}

      {/* المشاركون */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-lg">المشاركون ({participants.length})</h4>
          <button
            type="button"
            onClick={addParticipant}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            + إضافة صديق
          </button>
        </div>

        {participants.map((participant, index) => (
          <div key={participant.id} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-semibold">الشخص #{index + 1}</h5>
              {participants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParticipant(participant.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  حذف ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم *</label>
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="أحمد محمد"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  value={participant.phone}
                  onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="01xxxxxxxxx"
                />
              </div>

              {splitMethod === 'itemBased' && items.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">اختر العناصر:</label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border-2 border-gray-300 rounded-lg p-2 bg-white">
                    {items.map(item => (
                      <label key={item.id} className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={participant.selectedItems.some(si => si.id === item.id)}
                          onChange={() => toggleItemForParticipant(participant.id, item.id)}
                          className="ml-2"
                        />
                        <div className="text-xs flex-1">
                          <p className="font-medium">{item.name?.substring(0, 15)}...</p>
                          <p className="text-green-600">{item.price?.toFixed(2)} ج</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {splitMethod === 'custom' && (
                <div>
                  <label className="block text-sm font-medium mb-1">المبلغ (ج)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={participant.amount}
                    onChange={(e) => updateAmount(participant.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={splitMethod === 'equal'}
                  />
                </div>
              )}

              {splitMethod === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-1">النسبة المئوية (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    max="100"
                    value={participant.percentage}
                    onChange={(e) => updatePercentage(participant.id, e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={splitMethod === 'equal'}
                  />
                </div>
              )}

              <div className="bg-purple-100 rounded-lg p-3 flex items-center justify-center">
                <div className="text-center w-full">
                  <p className="text-xs text-gray-600">نصيبه</p>
                  <p className="text-xl font-bold text-purple-700">
                    {participant.amount.toFixed(2)} ج
                  </p>
                  {splitMethod === 'itemBased' && participant.selectedItems.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ({participant.selectedItems.length} عناصر)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* الملخص */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>المجموع المقسّم:</span>
            <span className="font-bold">{getTotalSplit().toFixed(2)} ج</span>
          </div>
          <div className="flex justify-between">
            <span>الإجمالي المطلوب:</span>
            <span className="font-bold">{(totalAmount + deliveryFee).toFixed(2)} ج</span>
          </div>
          <div className={`flex justify-between pt-2 border-t ${
            Math.abs(getRemaining()) < 0.01 ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="font-bold">المتبقي:</span>
            <span className="font-bold">{getRemaining().toFixed(2)} ج</span>
          </div>
        </div>
      </div>

      {!isValid() && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            ⚠️ {!participants.every(p => p.name.trim() !== '') 
              ? 'يرجى إدخال أسماء جميع المشاركين' 
              : 'المبلغ المقسّم لا يساوي الإجمالي المطلوب'}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => onSplitConfirm(participants)}
        disabled={!isValid()}
        className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        تأكيد التقسيم ✓
      </button>
    </div>
  )
}