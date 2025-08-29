export default (configuration, tab) => {
    switch (tab.category) {
        case 'CPU':
            return [0, 1, 2]
        /*const modules = configuration.memCount;
        if (!modules) return [0, 1, 2]
        if (configuration.chassis.platform === 'G3') {
            return modules > 16 ? [0, 2] : [0, 1, 2]
        } else {
            return modules > 12 ? [0, 2] : [0, 1, 2]
        }*/
        case 'Memory':
            if (['G3R', 'G4', 'G3'].includes(configuration.chassis.platform)) {
                if (configuration.cpuCount < 2) {
                    return [0, 1, 2, 4, 6, 8, 12, 16]
                } else {
                    return [0, 2, 4, 8, 12, 16, 24, 32]
                }
            }
            if (configuration.chassis.partNumber.match('-E-R')) {
                return Array.from(Array(17).keys()).filter(i => !(i % 2))
            }
            if (configuration.chassis.partNumber.match('-P-R')) {
                return Array.from(Array(25).keys()).filter(i => !(i % 2))
            }
            return Array.from(Array(configuration.memMaxCount + 2).keys()).filter(i => !(i % 2))
        case 'Riser':
            if (['QSRV-160402-E-R', 'QSRV-160802-E-R']
                .map(c => c.toLowerCase())
                .includes(configuration.chassis.partNumber.toLowerCase())
            ) {
                return [0, 1]
            }
            if(configuration.chassis.platform === 'G4' && configuration.chassis.units === 1) {
                return [0, 1]
            }
            return [0, 1, 2]
        //if(configuration.riserMaxCount <= 0) return [0]
        // return Array.from(Array(configuration.risersAvailable + 1).keys());
        case 'Power':
            return [0, 2]
        case 'Cables':
            return [0, 1, 2]
    }
    switch (tab.type) {
        case 'Transceiver':
            return Array.from(Array(17).keys())
        case 'GPU':
            return [0, 1, 2]
        case 'SSD m.2':
            if (configuration.M2expnvmeCount) return Array.from(Array(configuration.M2expnvmeCount * 2 + 1).keys())
            if (configuration.chassis.platform === 'G2R') {
                return[0,1]
                return configuration.M2RaidCount ? Array.from(Array(configuration.M2RaidCount * 2 + 2).keys()):[0, 1]
            }
            return [0, 1, 2]
        case 'Rear bay':
            if (configuration.chassis.platform === 'G2R' && configuration.chassis.units === 2) {
                return [1]
            }
            return [0, 1, 2]
        //return [0, 1, 2]
        case 'LAN OCP 3.0':
            if (configuration.chassis.platform === 'G4') {
                return [0, 1, 2]
            }
            return [0, 1]
        case 'Backplane':
            return [0, 1]
        case 'SSD U.2 NVMe':
            if (['QSRV-260802-E-R'].includes(configuration.chassis.partNumber)) {
                return [0, 1, 2]
            }
            if (['260802','270802','270812-P-R'].map(p=>'QSRV-'+p).includes(configuration.chassis.partNumber)) {
                if(configuration.backplaneCount){
                    return Array.from(Array(13).keys())
                }else{
                    return Array.from(Array(9).keys())
                }
            }
            if (['261202','271202','271212-P-R'].map(p=>'QSRV-'+p).includes(configuration.chassis.partNumber)) {
                if(configuration.backplaneCount){
                    return Array.from(Array(17).keys())
                }else{
                    return Array.from(Array(5).keys())
                }
            }

            const trimode8Adds = configuration.raidTrimode8iCount * 2
            const trimode16Adds = configuration.raidTrimode16iCount * 4
            //return Array.from(Array(5 + trimode8Adds + trimode16Adds).keys());
            const M2expnvmeCount = configuration.M2expnvmeCount * 2
            if (['QSRV-181000'].includes(configuration.chassis.partNumber)) {
                return Array.from(Array(11).keys())
            }

            if (['QSRV-281200'].includes(configuration.chassis.partNumber)) {
                return configuration.cpuCount === 2 ? Array.from(Array(13).keys()) : Array.from(Array(7).keys())
            }
            console.log('fffff', M2expnvmeCount , configuration.additionalNvmeDisksByBackplane , (configuration.chassis.units === 1 ? 1 : 5))
            return Array.from(Array(M2expnvmeCount + configuration.additionalNvmeDisksByBackplane + (configuration.chassis.units === 1 ? 1 : 5) + 1).keys());
        case 'HDD':
            if (configuration.chassis.partNumber === 'QSRV-260802-E-R') return [0, 1, 2, 3, 4, 5, 6, 7, 8]
            if (configuration.chassis.partNumber === 'QSRV-261202-E-R') return [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12]
        case 'SSD 2.5':
            if (configuration.chassis.partNumber === 'QSRV-262402R_active_BP') return Array.from(Array(25).keys())
            return Array.from(Array(configuration.chassis.disks + 1 + configuration.rearBayNotNVMeSFFCount * 2 + configuration.rearBayLFFCount * 2).keys());
    }
    return [0, 1, 2, 3, 4, 5]
}
