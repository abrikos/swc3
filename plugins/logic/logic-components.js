export default (configuration, components, tab) => {

    const componentsByType = tab.type ?
        components.filter(c => c.type === tab.type)
        :
        components.filter(c => c.category === tab.category)
    return componentsByType
        .filter(c => !c.deleted)
        .filter(component => {
            if (component.unitFix && (component.unitFix !== configuration.chassis.units)) return
            if (!component.platforms.includes(configuration.chassis.platform)) return
            switch (tab.category) {
                case 'CPU':
                    return configuration.chassis.cpu === component.type && component.platforms.includes(configuration.chassis.platform)
                case 'Storage':
                    if (configuration.chassis.partNumber === 'QSRV-2524') return component.isDiskSAS && component.isSFF
                    if (configuration.chassis.partNumber === 'QSRV-4524') return component.isDiskSAS && (component.isSFF || component.isLFF)
                    break
                case 'Riser':
                    if (configuration.chassis.units > 1 && ['G3', 'G3R'].includes(configuration.chassis.platform)) {
                        if (configuration.cpuCount === 1) return component.description.match(/port 1\/2/)
                    }
                    if (configuration.chassis.units < component.riserUnit) return false
                    if (configuration.chassis.partNumber === 'QSRV-463612-E-R') return false
                    if (configuration.chassis.units < component.riserUnit) return false
                    if (configuration.chassis.platform === 'G2R' && configuration.chassis.units === 2) return false
                    break
            }

            switch (tab.type) {
                case 'RAID':
                    if (configuration.chassis.partNumber.match('-E-R')) {
                        return component.partNumber !== '936124I2GR'
                    }
                    if (['QSRV-160402-E-R', 'QSRV-160802-E-R'].includes(configuration.chassis.partNumber)) {
                        return !component.partNumber.match(/^95/)
                    }
                    return true
                case 'HDD':
                    if (configuration.chassis.isSFF) return component.isSFF
                    if (['QSRV-171012-P-R', 'QSRV-272512-P-R', 'QSRV-282400', 'QSRV-181000'].includes(configuration.chassis.partNumber)) return !component.isLFF

                    if (['QSRV-160812-E-R', 'QSRV-160802-E-R', 'QSRV-160802-P-R', 'QSRV-262402-P-R', 'QSRV-262412-P-R'].includes(configuration.chassis.partNumber)) {
                        if (['20HD7SATA3.5', '22HD7SATA3.5', '20HD7SAS3.5', '22HD7SAS3.5'].includes(component.partNumber)) return false
                        if (component.isLFF) return false
                    }
                    if (configuration.chassis.isSFF) {
                        if (configuration.rearBayLFFCount) {
                            // фильтр дисков isSFF
                            //return component.isDiskSAS
                            return true
                        }
                        return component.isSFF
                    } else if (configuration.chassis.partNumber === 'QSRV-224') {
                        return component.isSFF
                    } else {
                        return true
                    }
                case 'Rear bay':
                    if (configuration.chassis.partNumber === 'QSRV-463612-E-R') return false
                    if (configuration.chassis.units === 1) return false
                    if (configuration.isRearBayNeeded) {
                        return component.partNumber === 'rbaySFFU2'
                    }
                    return true;
                case 'Backplane':
                    if (['QSRV-270802', 'QSRV-270812-P-R'].includes(configuration.chassis.partNumber) && component.partNumber === 'bplnab2u12b') return false
                    if (['QSRV-271202', 'QSRV-271212-P-R'].includes(configuration.chassis.partNumber) && component.partNumber !== 'bplnab2u12b') return false
                    return ['QSRV-171012-P-R', 'QSRV-271212-P-R', 'QSRV-271202', 'QSRV-161002', 'QSRV-1710',
                        'QSRV-171002','QSRV-161002','QSRV-161002A', 'QSRV-260802', 'QSRV-270802', 'QSRV-270812-P-R',
                        'QSRV-260802A', 'QSRV-161002', 'QSRV-260802', 'QSRV-281200'].includes(configuration.chassis.partNumber)

                case 'SSD U.2 NVMe':
                    if (configuration.additionalNvmeDisksByBackplane) {
                        return true
                    }
                    return !['QSRV-463612-E-R', 'QSRV-260802-P-R'].includes(configuration.chassis.partNumber)

                case 'GPU':
                    if (['QSRV-260812-E-R', 'QSRV-261212-E-R', 'QSRV-262412-E-R', 'QSRV-463612-ER'].includes(configuration.chassis.partNumber)) {
                        return ['GFGT730', 'T4004', 'T10008', 'RTXA20006', 'TESLAA216', 'TESLAT416', 'TESLAl424'].includes(component.partNumber)
                    }
                    if (['QSRV-260802-E-R', 'QSRV-261202-E-R', 'QSRV-262402-E-R'].includes(configuration.chassis.partNumber)) {
                        return ['GFGT730', 'T6004', 'TESLAT416', 'TESLAA1024'].includes(component.partNumber)
                    }
                    if (['QSRV-160402-E-R', 'QSRV-160802-P-R', 'QSRV-160402-P-R'].includes(configuration.chassis.partNumber)) {
                        return !component.partNumber.match('TESLA')
                    }
                    if (['QSRV-160412-E-R', 'QSRV-160412-P-R', 'QSRV-160802-E-R', 'QSRV-160812-P-R'].includes(configuration.chassis.partNumber)) {
                        return ['GFGT730', 'T4004'].includes(component.partNumber)
                    }
                    return true
                case 'LAN OCP 3.0':
                    if (configuration.chassis.platform === 'G2R') return false
                    if (['QSRV-160402-E-R', 'QSRV-160802-E-R', 'QSRV-260802-E-R']
                        .map(c => c.toLowerCase())
                        .includes(configuration.chassis.partNumber.toLowerCase())
                    ) {
                        return false
                    }
                    return true

            }
            return true
        }).map(c => {
            if (configuration.cpuCount && c.category === 'CPU') {
                c.countDisabled = true
            }
            if (configuration.gpuCount && c.type === 'GPU') {
                c.countDisabled = true
            }
            if (configuration.memCount && c.category === 'Memory') {
                c.countDisabled = true
            }
            if (configuration.powerCount && c.category === 'Power') {
                c.countDisabled = true
            }
            if (c.category === 'Riser' && configuration.chassis.platform === 'G4') {
                c.selectDisabled = true
            }
            if (configuration.cablesCount && c.category === 'Cables') {
                //c.countDisabled = true
            }
            if (configuration.ocpCount && c.type === 'LAN OCP 3.0') {
                if (configuration.chassis.platform !== 'G4') {
                    c.countDisabled = true
                }
            }
            if (configuration.backplaneCount && c.type === 'Backplane') {
                c.countDisabled = true
            }
            return c
        })

}
