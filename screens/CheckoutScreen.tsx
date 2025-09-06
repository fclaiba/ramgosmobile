import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getCouponById } from '../services/coupons';
import { addPurchase } from '../services/history';
import { validateReferralCode, ReferralInfo } from '../services/referrals';

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
  const canContinueStep2 = accept && /\d{12,19}/.test(card.replace(/\s+/g, '')) && /^\d{2}\/?\d{2}$/.test(exp) && /^\d{3,4}$/.test(cvc);

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
          setStep(3);
          // Registrar compra en historial
          const orderId = `ord_${Date.now()}`;
          addPurchase({
            id: orderId,
            couponId: coupon.id,
            title: coupon.title,
            merchant: coupon.sector === 'gastronomia' ? 'Restaurante' : coupon.sector === 'bienestar' ? 'Spa' : 'Comercio',
            sector: coupon.sector,
            status: 'active',
            validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
            createdAt: new Date().toISOString(),
            qrCodeUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCya015-ypKkmx-7wJKdZ9X0xwsyXTt7p9Qwrifl0VuIh-Xg-0jITpm_nM-SAhyxLfWwOGoyhdFDg9SYppovfMlfZdAhzMaZ1qzcHtfL9GrsWCyeaHpAjYbRCyhHBoG5xvXDKnk87AGvfocdTeEt7zgQbnWF17XX5NGsWhOK5I13gx2M5X0QYhwWwJp7XcWi1Kmd4MHSBVOQL-kk-aHvnu5heHkxpORyWZ-vzeic9J2sp9QeNwlvF0nppUts5wC_xIxgvvRmSa4hfva',
          });
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
            <View style={[styles.stepCircle, { backgroundColor: step >= 3 ? '#e2e8f0' : '#e2e8f0' }] }>
              <MaterialIcons name={'check-circle'} size={18} color={'#64748b'} />
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
              <View style={styles.inputWrap}>
                <TextInput
                  value={card}
                  onChangeText={setCard}
                  keyboardType="number-pad"
                  placeholder="•••• •••• •••• ••••"
                  placeholderTextColor="#94a3b8"
                  style={styles.input}
                />
                <MaterialIcons name={'credit-card'} size={18} color={'#94a3b8'} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Vencimiento</Text>
                <TextInput
                  value={exp}
                  onChangeText={setExp}
                  keyboardType="number-pad"
                  placeholder="MM/YY"
                  placeholderTextColor="#94a3b8"
                  style={styles.inputSolo}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CVC</Text>
                <TextInput
                  value={cvc}
                  onChangeText={setCvc}
                  keyboardType="number-pad"
                  placeholder="•••"
                  placeholderTextColor="#94a3b8"
                  style={styles.inputSolo}
                />
              </View>
            </View>

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
          <View style={[styles.card, { alignItems: 'center', paddingVertical: 24 }] }>
            <View style={styles.successIconWrap}>
              <MaterialIcons name={'check'} size={40} color={'#22c55e'} />
            </View>
            <Text style={[styles.title, { marginTop: 12 }]}>¡Pago Exitoso!</Text>
            <Text style={styles.helper}>Tu bono ha sido generado. Escanea el código QR para usarlo.</Text>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCya015-ypKkmx-7wJKdZ9X0xwsyXTt7p9Qwrifl0VuIh-Xg-0jITpm_nM-SAhyxLfWwOGoyhdFDg9SYppovfMlfZdAhzMaZ1qzcHtfL9GrsWCyeaHpAjYbRCyhHBoG5xvXDKnk87AGvfocdTeEt7zgQbnWF17XX5NGsWhOK5I13gx2M5X0QYhwWwJp7XcWi1Kmd4MHSBVOQL-kk-aHvnu5heHkxpORyWZ-vzeic9J2sp9QeNwlvF0nppUts5wC_xIxgvvRmSa4hfva' }}
              style={{ width: 200, height: 200, marginTop: 16, borderRadius: 12 }}
            />
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

  card: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
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
  refRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refInput: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#ffffff', color: '#0f172a' },
  refApplyBtn: { backgroundColor: PRIMARY, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  refApplyText: { color: '#ffffff', fontWeight: '800' },
  refRemoveBtn: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ffffff' },
  refSummary: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ecfdf5', padding: 8, borderRadius: 8 },
  refSummaryText: { color: '#065f46', fontWeight: '700' },
});


