import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'displayName',
    standalone: true
})
export class DisplayNamePipe implements PipeTransform {

    /**
     * @param idOrIds
     * @param list
     * @param sep      – separator to use when idOrIds is an array (default “, ”).
     */
    transform(
        idOrIds: string | number | (string | number)[] | null | undefined,
        list: { id: any; displayName: string }[] | null | undefined,
        sep = ', '
    ): string {

        if (idOrIds == null) {
            return '';
        }

        if (Array.isArray(idOrIds)) {
            if (!idOrIds.length) { return ''; }

            return idOrIds
                .map(id => list?.find(x => x.id === id)?.displayName ?? id)
                .join(sep);
        }

        return list?.find(x => x.id === idOrIds)?.displayName ?? String(idOrIds);
    }
}
