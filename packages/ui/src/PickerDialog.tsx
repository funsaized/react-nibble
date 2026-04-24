import { useCallback } from 'react'
import type { InspectorCandidate } from '@react-nibble/core'
import {
  Clipboard,
  Modal,
  Pressable,
  View as RNView,
  Text as RNText,
  ScrollView,
  StyleSheet,
} from 'react-native'
import type { InspectorTokenOverrides } from './tamagui/themeBridge.js'
import { resolveInspectorTokens } from './tamagui/themeBridge.js'

export interface PickerDialogProps {
  visible: boolean
  candidates: InspectorCandidate[]
  editorName?: string
  isDark?: boolean
  tokens?: InspectorTokenOverrides
  onOpen: (candidate: InspectorCandidate) => void
  onCopy: (candidate: InspectorCandidate) => void
  onClose: () => void
  testID?: string
}

export function PickerDialog({
  visible,
  candidates,
  editorName,
  isDark = false,
  tokens,
  onOpen,
  onCopy,
  onClose,
  testID,
}: PickerDialogProps) {
  const t = resolveInspectorTokens(tokens, isDark)

  const handleCopy = useCallback(
    (c: InspectorCandidate) => {
      if (c.source) {
        Clipboard.setString(`${c.source.file}:${c.source.line}:${c.source.column ?? 1}`)
      }
      onCopy(c)
    },
    [onCopy]
  )

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID ?? 'nibble-picker'}
    >
      <Pressable style={styles.backdrop} onPress={onClose} testID="nibble-picker-backdrop">
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[styles.dialog, { backgroundColor: t.pickerBackground }]}
        >
          <RNView style={styles.header}>
            <RNText style={[styles.title, { color: t.pickerForeground }]}>react-nibble</RNText>
            <Pressable onPress={onClose} style={styles.close} testID="nibble-picker-close">
              <RNText style={{ color: t.pickerForeground, fontSize: 18 }}>×</RNText>
            </Pressable>
          </RNView>
          {candidates.length === 0 ? (
            <RNText style={[styles.empty, { color: t.pickerForeground }]}>
              No candidates found
            </RNText>
          ) : (
            <ScrollView style={styles.list} testID="nibble-picker-list">
              {candidates.map((c, idx) => {
                const key = c.source
                  ? `${c.source.file}:${c.source.line}`
                  : `no-source-${String(idx)}`
                return (
                  <RNView
                    key={key}
                    style={[styles.row, { borderBottomColor: isDark ? '#2a2a2a' : '#eee' }]}
                    testID={`nibble-picker-row-${String(idx)}`}
                  >
                    <RNView style={styles.nameContainer}>
                      <RNText
                        style={[styles.name, { color: t.pickerForeground }]}
                        numberOfLines={1}
                      >
                        {c.name}
                      </RNText>
                      {c.source ? (
                        <RNText
                          style={[styles.source, { color: isDark ? '#888' : '#555' }]}
                          numberOfLines={1}
                        >
                          {c.source.file.split('/').pop()}:{String(c.source.line)}:
                          {String(c.source.column ?? 1)}
                        </RNText>
                      ) : null}
                    </RNView>
                    <Pressable
                      onPress={() => onOpen(c)}
                      disabled={!c.source}
                      style={[styles.btn, { backgroundColor: c.source ? t.accentColor : '#444' }]}
                      testID={`nibble-picker-open-${String(idx)}`}
                    >
                      <RNText style={styles.btnText}>
                        Open{editorName ? ` in ${editorName}` : ''}
                      </RNText>
                    </Pressable>
                    <Pressable
                      onPress={() => handleCopy(c)}
                      disabled={!c.source}
                      style={[styles.btn, { backgroundColor: isDark ? '#333' : '#ccc' }]}
                      testID={`nibble-picker-copy-${String(idx)}`}
                    >
                      <RNText style={[styles.btnText, { color: isDark ? '#fff' : '#222' }]}>
                        Copy
                      </RNText>
                    </Pressable>
                  </RNView>
                )
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: { borderRadius: 10, maxHeight: '80%', overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  title: { fontSize: 14, fontWeight: '600' },
  close: { padding: 4 },
  empty: { textAlign: 'center', padding: 20 },
  list: { maxHeight: 400 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  nameContainer: { flex: 1 },
  name: { fontSize: 13, fontWeight: '500' },
  source: { fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  btn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '500' },
})
