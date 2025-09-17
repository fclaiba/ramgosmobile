import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getCouponById } from '../services/coupons';
import { addPurchase } from '../services/history';
import { validateReferralCode, ReferralInfo } from '../services/referrals';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const PRIMARY = '#1173d4';

type Props = { route: { params: { id: string; qty?: number } }; navigation: any };

export default function CheckoutScreen({ route, navigation }: Props) {
  const { id, qty: initialQty = 1 } = route.params ?? {};
  const coupon = getCouponById(id);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [qty, setQty] = useState(Math.max(1, Math.min(initialQty, coupon?.remaining ?? 1)));
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [accept, setAccept] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [refCode, setRefCode] = useState('');
  const [refLoading, setRefLoading] = useState(false);
  const [refApplied, setRefApplied] = useState<ReferralInfo | null>(null);
  const [cardBrand, setCardBrand] = useState<'visa'|'mastercard'|'amex'|'unknown'>('unknown');
  const [cardError, setCardError] = useState<string | null>(null);
  const [expError, setExpError] = useState<string | null>(null);
  const [cvcError, setCvcError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderCreatedAt, setOrderCreatedAt] = useState<number | null>(null);
  const [orderValidUntil, setOrderValidUntil] = useState<number | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const totalBefore = useMemo(() => (coupon ? coupon.price * qty : 0), [coupon, qty]);
  const discount = useMemo(() => (refApplied ? (totalBefore * refApplied.discountPct) / 100 : 0), [totalBefore, refApplied]);
  const total = useMemo(() => Math.max(0, totalBefore - discount), [totalBefore, discount]);

  if (!coupon) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ padding: 16 }}>
          <Text style={styles.title}>Bono no encontrado</Text>
          <Pressable style={[styles.ctaSecondary, { marginTop: 12 }]} onPress={() => navigation.goBack()}>
            <MaterialIcons name={'arrow-back'} size={18} color={'#111418'} />
            <Text style={[styles.meta, { fontWeight: '800' }]}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canContinueStep1 = qty >= 1;
  // Helpers de validación/máscaras para tarjeta
  const luhnCheck = (num: string): boolean => {
    let sum = 0; let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit; shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };
  const detectBrand = (digits: string): 'visa'|'mastercard'|'amex'|'unknown' => {
    if (/^4\d{0,}$/.test(digits)) return 'visa';
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))\d{0,}$/.test(digits)) return 'mastercard';
    if (/^3[47]\d{0,}$/.test(digits)) return 'amex';
    return 'unknown';
  };
  const formatCard = (digits: string, brand: 'visa'|'mastercard'|'amex'|'unknown'): string => {
    if (brand === 'amex') {
      // 4-6-5
      return digits.replace(/(\d{1,4})(\d{1,6})?(\d{1,5})?/, (_m, a, b, c) => [a, b, c].filter(Boolean).join(' '));
    }
    // 4-4-4-4
    return digits.replace(/(\d{1,4})(\d{1,4})?(\d{1,4})?(\d{1,4})?/, (_m, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));
  };
  const handleCardChange = (t: string) => {
    const digits = t.replace(/\D+/g, '').slice(0, 19);
    const brand = detectBrand(digits);
    setCardBrand(brand);
    const formatted = formatCard(digits, brand);
    setCard(formatted);
    // Validación inmediata básica
    if (digits.length >= (brand==='amex'?15:16)) setCardError(luhnCheck(digits) ? null : 'Número inválido');
    else setCardError(null);
  };
  const handleExpChange = (t: string) => {
    const digits = t.replace(/\D+/g, '').slice(0, 4);
    let val = digits;
    if (digits.length >= 3) val = `${digits.slice(0,2)}/${digits.slice(2)}`; else if (digits.length >= 1) val = digits;
    setExp(val);
  };
  const validateExpiry = (val: string): boolean => {
    const m = val.match(/^(\d{2})\/(\d{2})$/); if (!m) return false;
    const mm = parseInt(m[1], 10); const yy = parseInt(m[2], 10);
    if (mm < 1 || mm > 12) return false;
    const year = 2000 + yy; const monthIndex = mm - 1;
    const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).getTime();
    return endOfMonth >= Date.now();
  };
  const handleExpBlur = () => setExpError(validateExpiry(exp) ? null : 'Fecha inválida');
  const handleCvcChange = (t: string) => {
    const max = cardBrand === 'amex' ? 4 : 3;
    const digits = t.replace(/\D+/g, '').slice(0, max);
    setCvc(digits);
    setCvcError(digits.length === max ? null : null);
  };
  const handleCvcBlur = () => {
    const max = cardBrand === 'amex' ? 4 : 3;
    setCvcError(cvc.length === max ? null : `CVV de ${max} dígitos`);
  };
  const isCardValid = (() => { const d = card.replace(/\s+/g,''); return (cardBrand==='amex'?d.length===15:d.length>=16) && luhnCheck(d); })();
  const isExpValid = validateExpiry(exp);
  const isCvcValid = (() => { const max = cardBrand==='amex'?4:3; return cvc.length===max; })();
  const canContinueStep2 = accept && isCardValid && isExpValid && isCvcValid;

  const onNext = () => {
    if (step === 1 && canContinueStep1) setStep(2);
    else if (step === 2 && canContinueStep2) {
      setProcessing(true);
      setPaymentError(null);
      // Simulación de procesamiento de pago
      setTimeout(() => {
        setProcessing(false);
        // Simular éxito 85% de las veces
        if (Math.random() < 0.85) {
          const newOrderId = `ord_${Date.now()}`;
          const createdAtIso = new Date().toISOString();
          const validUntilIso = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
          const qrData = encodeURIComponent(`coupon:${coupon.id}|order:${newOrderId}|title:${coupon.title}|valid:${validUntilIso}`);
          const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&format=png&qzone=4&data=${qrData}`;
          // Registrar compra en historial (mock)
          addPurchase({
            id: newOrderId,
            couponId: coupon.id,
            title: coupon.title,
            merchant: coupon.sector === 'gastronomia' ? 'Restaurante' : coupon.sector === 'bienestar' ? 'Spa' : 'Comercio',
            sector: coupon.sector,
            status: 'active',
            validUntil: validUntilIso,
            createdAt: createdAtIso,
            qrCodeUrl: qr,
          });
          setOrderId(newOrderId);
          setOrderCreatedAt(Date.parse(createdAtIso));
          setOrderValidUntil(Date.parse(validUntilIso));
          setQrUrl(qr);
          setStep(3);
        }
        else setPaymentError('No pudimos procesar tu pago. Verifica los datos e intenta nuevamente.');
      }, 1800);
    }
  };

  const onBack = () => {
    if (step === 1) navigation.goBack();
    else if (step === 2) setStep(1);
    else if (step === 3) navigation.popToTop();
  };

  function formatRemaining(validUntil: number | null): string {
    if (!validUntil) return '-';
    const ms = validUntil - Date.now();
    if (ms <= 0) return 'Vencido';
    const days = Math.floor(ms / (24*3600*1000));
    if (days >= 1) return `${days} días`;
    const hours = Math.floor(ms / (3600*1000));
    if (hours >= 1) return `${hours} h`;
    const mins = Math.floor(ms / (60*1000));
    return `${mins} min`;
  }

  const onDownloadQr = async () => {
    if (!qrUrl) return;
    try {
      const fileUri = FileSystem.cacheDirectory + `qr-${orderId || 'coupon'}.png`;
      const res = await FileSystem.downloadAsync(qrUrl, fileUri);
      await Sharing.shareAsync(res.uri, { mimeType: 'image/png', dialogTitle: 'Descargar QR' });
    } catch {}
  };

  const onShareQr = async () => {
    if (!qrUrl) return;
    try {
      const fileUri = FileSystem.cacheDirectory + `qr-${orderId || 'coupon'}.png`;
      const res = await FileSystem.downloadAsync(qrUrl, fileUri);
      await Sharing.shareAsync(res.uri, { mimeType: 'image/png', dialogTitle: 'Compartir QR' });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconBtn} onPress={onBack} accessibilityLabel="Atrás">
          <MaterialIcons name={'arrow-back'} size={22} color={'#111418'} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout de Bono</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Stepper */}
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.stepCircle, { backgroundColor: PRIMARY }]}>
              <MaterialIcons name={'shopping-cart'} size={18} color={'#ffffff'} />
            </View>
            <View style={[styles.stepLine, { backgroundColor: step >= 2 ? PRIMARY : '#e2e8f0' }]} />
            <View style={[styles.stepCircle, { backgroundColor: step >= 2 ? PRIMARY : '#e2e8f0' }]}>
              <MaterialIcons name={'credit-card'} size={18} color={step >= 2 ? '#ffffff' : '#64748b'} />
            </View>
            <View style={[styles.stepLine, { backgroundColor: step >= 3 ? PRIMARY : '#e2e8f0' }]} />
            <View style={[styles.stepCircle, { backgroundColor: step >= 3 ? PRIMARY : '#e2e8f0' }] }>
              <MaterialIcons name={'check-circle'} size={18} color={step >= 3 ? '#ffffff' : '#64748b'} />
            </View>
          </View>
        </View>

        {/* Step 1: Resumen */}
        {(step === 1 || step === 2) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resumen de Compra</Text>
            <View style={styles.sep} />

            <View style={styles.rowBetween}>
              <Text style={styles.meta}>Bono:</Text>
              <Text style={styles.value}>{coupon.title}</Text>
            </View>

            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <Text style={styles.meta}>Cantidad:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}><Text style={styles.qtyBtnText}>-</Text></Pressable>
                <Text style={styles.value}>{qty}</Text>
                <Pressable style={[styles.qtyBtn, { backgroundColor: PRIMARY, borderColor: PRIMARY }]} onPress={() => setQty(q => Math.min(q + 1, coupon.remaining))}><Text style={[styles.qtyBtnText, { color: '#ffffff' }]}>+</Text></Pressable>
              </View>
            </View>

            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <Text style={styles.meta}>Precio:</Text>
              <Text style={styles.value}>${coupon.price.toFixed(2)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            <View style={{ height: 8 }} />
            <View style={styles.refRow}>
              <TextInput
                value={refApplied ? refApplied.code : refCode}
                onChangeText={setRefCode}
                placeholder="Código de referido"
                placeholderTextColor="#94a3b8"
                editable={!refApplied}
                style={styles.refInput}
              />
              {refApplied ? (
                <Pressable style={styles.refRemoveBtn} onPress={() => { setRefApplied(null); setRefCode(''); }}>
                  <MaterialIcons name={'close'} size={18} color={'#111418'} />
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.refApplyBtn, !refCode.trim() && { opacity: 0.5 }]}
                  disabled={!refCode.trim() || refLoading}
                  onPress={async () => {
                    setRefLoading(true);
                    const info = await validateReferralCode(refCode);
                    setRefLoading(false);
                    if (info) setRefApplied(info);
                    else setPaymentError('Código de referido inválido');
                  }}
                >
                  {refLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.refApplyText}>Aplicar</Text>}
                </Pressable>
              )}
            </View>
            {!!refApplied && (
              <View style={styles.refSummary}>
                <MaterialIcons name={'local-offer'} size={16} color={'#16a34a'} />
                <Text style={styles.refSummaryText}>Descuento {refApplied.discountPct}% por {refApplied.influencerName} - −${discount.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 2: Pago */}
        {step === 2 && (
          <View style={[styles.card, { marginTop: 16 }] }>
            <Text style={styles.cardTitle}>Información de Pago</Text>
            <Text style={styles.helper}>Pago seguro impulsado por Stripe.</Text>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>Número de Tarjeta</Text>
              <View style={[styles.inputWrap, cardError && { borderColor: '#ef4444' }]}>
                <TextInput
                  value={card}
                  onChangeText={handleCardChange}
                  keyboardType="number-pad"
                  placeholder={cardBrand==='amex'?"•••• •••••• •••••":"•••• •••• •••• ••••"}
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                  maxLength={cardBrand==='amex'?17:19}
                />
                <View style={{ flexDirection:'row', alignItems:'center', gap: 6 }}>
                  <Text style={{ color:'#64748b', fontWeight:'800', textTransform:'uppercase' }}>{cardBrand==='unknown'?'':cardBrand}</Text>
                  <MaterialIcons name={'credit-card'} size={18} color={'#94a3b8'} />
                </View>
              </View>
              {cardError && <Text style={styles.fieldError}>{cardError}</Text>}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Vencimiento</Text>
                <TextInput
                  value={exp}
                  onChangeText={handleExpChange}
                  onBlur={handleExpBlur}
                  keyboardType="number-pad"
                  placeholder="MM/YY"
                  placeholderTextColor="#94a3b8"
                  style={[styles.inputSolo, expError && { borderColor:'#ef4444' }]}
                  maxLength={5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CVC</Text>
                <TextInput
                  value={cvc}
                  onChangeText={handleCvcChange}
                  onBlur={handleCvcBlur}
                  keyboardType="number-pad"
                  placeholder={cardBrand==='amex'?"••••":"•••"}
                  placeholderTextColor="#94a3b8"
                  style={[styles.inputSolo, cvcError && { borderColor:'#ef4444' }]}
                  maxLength={cardBrand==='amex'?4:3}
                />
              </View>
            </View>
            {(expError || cvcError) && (
              <Text style={styles.fieldError}>{expError || cvcError}</Text>
            )}

            <Pressable onPress={() => setAccept(v => !v)} style={styles.termsRow}>
              <View style={[styles.checkbox, accept && { backgroundColor: PRIMARY, borderColor: PRIMARY }]} />
              <Text style={styles.termsText}>Acepto los <Text style={{ color: PRIMARY, fontWeight: '800' }}>términos y condiciones</Text> y entiendo que esta compra no es reembolsable.</Text>
            </Pressable>

            {paymentError && (
              <View style={styles.errorBox}>
                <MaterialIcons name={'error-outline'} size={18} color={'#ef4444'} />
                <Text style={styles.errorText}>{paymentError}</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Éxito */}
        {step === 3 && (
          <View style={[styles.card, { paddingVertical: 16 }] }>
            {/* Encabezado de orden */}
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.orderTitle}>Orden de Compra</Text>
              {!!orderId && <Text style={styles.orderId}>#{orderId}</Text>}
            </View>
            <View style={{ height: 12 }} />
            {/* QR */}
            <View style={{ alignItems: 'center' }}>
              <View style={styles.qrBox}>
                <Image source={{ uri: qrUrl || '' }} style={{ width: 220, height: 220 }} resizeMode={'contain'} />
              </View>
            </View>
            <View style={{ height: 16 }} />
            {/* Detalles */}
            <View style={styles.rowBetweenTight}>
              <Text style={styles.detailLabel}>Válido hasta</Text>
              <Text style={styles.detailValue}>{orderValidUntil ? new Date(orderValidUntil).toLocaleDateString() : '-'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBetweenTight}>
              <Text style={styles.detailLabel}>Fecha de compra</Text>
              <Text style={styles.detailValue}>{orderCreatedAt ? new Date(orderCreatedAt).toLocaleString() : '-'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBetweenTight}>
              <Text style={styles.detailLabel}>Tiempo de validez restante</Text>
              <Text style={[styles.detailValue, { color: '#ef4444', fontWeight: '800' }]}>{formatRemaining(orderValidUntil)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBetweenTight}>
              <Text style={styles.detailLabel}>Precio total</Text>
              <Text style={[styles.detailValue, { fontWeight: '900' }]}>{`$${total.toFixed(2)}`}</Text>
            </View>
            <View style={{ height: 12 }} />
            {/* Acciones */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable style={[styles.actionPrimary, { flex: 1 }]} onPress={onDownloadQr} accessibilityLabel={'Descargar QR'}>
                <MaterialIcons name={'file-download'} size={18} color={'#ffffff'} />
                <Text style={styles.actionPrimaryText}>Descargar QR</Text>
              </Pressable>
              <Pressable style={[styles.actionSecondary, { flex: 1 }]} onPress={onShareQr} accessibilityLabel={'Compartir QR'}>
                <MaterialIcons name={'share'} size={18} color={'#111418'} />
                <Text style={styles.actionSecondaryText}>Compartir QR</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable style={styles.ctaSecondary} onPress={onBack}>
          <MaterialIcons name={'arrow-back'} size={18} color={'#111418'} />
          <Text style={[styles.meta, { fontWeight: '800' }]}>{step === 3 ? 'Inicio' : 'Atrás'}</Text>
        </Pressable>
        {step !== 3 && (
          <Pressable style={[styles.ctaPrimary, (step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2) ? styles.ctaDisabled : undefined]} disabled={(step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)} onPress={onNext}>
            <Text style={styles.ctaPrimaryText}>{step === 1 ? 'Siguiente' : 'Pagar'}</Text>
            <MaterialIcons name={'arrow-forward'} size={18} color={'#ffffff'} />
          </Pressable>
        )}
      </View>

      {processing && (
        <View style={styles.processing}>
          <View style={styles.spinner} />
          <Text style={[styles.title, { marginTop: 12, fontSize: 16 }]}>Procesando pago...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#ffffff' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  iconBtn: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },

  stepCircle: { height: 32, width: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepLine: { height: 2, width: 64, backgroundColor: '#e2e8f0' },

  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, boxShadow: '0px 8px 16px rgba(0,0,0,0.04)', elevation: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111418' },
  sep: { height: 1, backgroundColor: '#e5e7eb', marginTop: 10, marginBottom: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { color: '#475569', fontSize: 14 },
  value: { color: '#0f172a', fontWeight: '700' },
  qtyBtn: { height: 24, width: 24, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#475569', fontWeight: '800' },
  totalRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  totalValue: { fontSize: 20, fontWeight: '900', color: PRIMARY },

  helper: { color: '#64748b', marginTop: 4 },
  inputLabel: { color: '#1f2937', fontWeight: '700', fontSize: 13 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#f8fafc' },
  input: { flex: 1, paddingVertical: 10, color: '#0f172a' },
  inputSolo: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f8fafc', color: '#0f172a' },
  fieldError: { color: '#b91c1c', fontSize: 12, marginTop: 6, fontWeight: '700' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 12 },
  checkbox: { height: 20, width: 20, borderRadius: 4, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#ffffff' },
  termsText: { flex: 1, color: '#334155', fontSize: 13 },
  errorBox: { marginTop: 8, backgroundColor: '#fee2e2', borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  errorText: { color: '#b91c1c', fontWeight: '700' },

  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb', padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ctaSecondary: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff' },
  ctaPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PRIMARY, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  ctaPrimaryText: { color: '#ffffff', fontWeight: '900' },
  ctaDisabled: { opacity: 0.5 },

  title: { fontSize: 22, fontWeight: '900', color: '#111827' },
  processing: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  spinner: { height: 56, width: 56, borderRadius: 28, borderWidth: 4, borderColor: PRIMARY, borderTopColor: 'transparent' },
  successIconWrap: { height: 96, width: 96, borderRadius: 48, borderWidth: 6, borderColor: 'rgba(34,197,94,0.3)', alignItems: 'center', justifyContent: 'center' },
  orderTitle: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  orderId: { color: '#0f172a', fontWeight: '900' },
  qrBox: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16 },
  rowBetweenTight: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  detailLabel: { color: '#64748b' },
  detailValue: { color: '#111827', fontWeight: '700' },
  divider: { height: 8, backgroundColor: '#f3f4f6', marginVertical: 4 },
  actionPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PRIMARY, paddingVertical: 12, borderRadius: 12 },
  actionPrimaryText: { color: '#ffffff', fontWeight: '900' },
  actionSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 12, borderRadius: 12 },
  actionSecondaryText: { color: '#111418', fontWeight: '900' },
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refInput: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#ffffff', color: '#0f172a' },
  refApplyBtn: { backgroundColor: PRIMARY, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  refApplyText: { color: '#ffffff', fontWeight: '800' },
  refRemoveBtn: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ffffff' },
  refSummary: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ecfdf5', padding: 8, borderRadius: 8 },
  refSummaryText: { color: '#065f46', fontWeight: '700' },
});


