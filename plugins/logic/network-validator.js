module.exports = {
    checkPowers({items}) {
        const errors = []
        const warnings = []
        for (const item of items) {
            const powerForDevice = items.filter(i => i.powerForDevice?.id === item.device?.id).reduce((a, b) => a * 1 + b.count * 1, 0)

            if (item.device?.powerCount > powerForDevice) {
                errors.push({item, needed: item.device?.powerCount * item.count - powerForDevice})
            }
            if (item.device?.powerCount < powerForDevice) {
                warnings.push({item, needed: item.device?.powerCount * item.count - powerForDevice})
            }
            //console.log(item.device.name, powerForDevice)
        }
        return {errors, warnings}
    },
    checkTrans({items}) {
        const info = []
        const errors = []
        const warnings = []
        for (const item of items) {
            const transForDevice = items.filter(i => i.transForDevice?.id === item.device?.id).reduce((a, b) => a * 1 + b.count * 1, 0)
            for(const trans of item.device.trans){
                info.push({item, trans})
            }
        }
        return {errors, warnings, info}
    }
}
