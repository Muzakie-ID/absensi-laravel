/**
 * Ambil urutan KBM (learning_sequence) dari mapping_source time slot.
 * Mendukung format 'kbm_1' maupun '1'. Mengembalikan null untuk slot non-KBM
 * ('fixed', kosong, atau format tidak dikenal).
 *
 * Harus konsisten dengan App\Models\TimeSlot::parseSequence() di backend.
 */
export function parseSequence(mappingSource) {
    if (mappingSource === null || mappingSource === undefined) return null;

    const match = String(mappingSource).trim().match(/^(?:kbm_)?(\d+)$/i);
    if (!match) return null;

    const sequence = parseInt(match[1], 10);
    return sequence > 0 ? sequence : null;
}
