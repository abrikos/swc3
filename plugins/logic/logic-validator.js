export default function (configuration) {
    const result = {
        errors: [],
        warnings: [],
    };
    if (configuration.parts.find(p => p.component.partNumber === 'VROCSTANMOD')) {
        result.warnings.push('VROC не может быть загрузочным (boot) диском.')
    }
    if (configuration.parts.find(p => p.component.partNumber === 'bplnab2u12b')) {
        // if (configuration.cpuCount < 2) {
        //     result.errors.push('Для  bplnab2u12b необходимо 2 процессора')
        // }
        //anybayCount
        if (configuration.ssdU2Count >4 && configuration.ssdU2Count <=8 ) {
            result.warnings.push('нужен ретаймер, который занимает один слот x16')
        }
        if (configuration.ssdU2Count >8 && configuration.ssdU2Count <=12 ) {
            result.warnings.push('нужно 2 ретаймера, которые занимают 2x16 слота')
        }
        if (configuration.ssdU2Count >12 && configuration.ssdU2Count <=14 ) {
            result.warnings.push('нужна 1х rbaySFFU2 обязательно и на выбор :  3х16 слота который будут заняты ретаймерами или 2 ретаймера х16 и RAID Trimode')
        }
        if (configuration.ssdU2Count >14 && configuration.ssdU2Count <=16 ) {
            result.warnings.push('нужна 2х rbaySFFU2 обязательно и на выбор :  3х16 слота который будут заняты ретаймерами или 2 ретаймера х16 и RAID Trimode')
        }

        if (configuration.riserX16Count && configuration.anybayCount === 2) {
            result.errors.push('Ошибка количества RiserX16 и AnyBay')
        }
        if (configuration.nvmeRearBayCount) {
            result.errors.push('Необходим третий слот x16')
        }
    }

    if(configuration.pcieComponentSlots.length) {
        let comp16 = 0
        let comp8 = 0
        for(const comp of configuration.pcieComponentSlots) {
            if(comp.slots === '16') {
                comp16 += comp.count
            }
            if(comp.slots === '8') {
                comp8 += comp.count
            }
        }
        let riser8 = 0
        let riser16 = 0
        const riserCapacities = []
        for(const riser of configuration.pcieRiserSlots){
            const slots = riser.slots.split('|')
            riserCapacities.push(riser.slots)
            for(const slot of slots) {
                const counts = slot.split('x')
                if(counts[1]==='16'){
                    riser16 += counts[0] * 1 * riser.count
                }
                if(counts[1]==='8'){
                    riser8 += counts[0] * 1 * riser.count
                }
            }
        }

        const free16 = riser16 - comp8 - comp16
        const free8 = riser8 - comp8 - comp16
        console.log(riserCapacities)
        if(free16<0){
            result.errors.push(`Количество PCI-E устройств длинной 8:(${comp8}) и длинной 16:(${comp16}) превышает вместимость слотов на райзерах  (${riserCapacities.join(', ')})`)
        }

    }


    if (configuration.chassis.platform === 'G4') {
        if (['QSRV-281200'].includes(configuration.chassis.partNumber)) {
            if (configuration.cpuCount <= 1 && configuration.ssdU2Count > 6) {
                result.errors.push(`SSD U.2 NVMe возможно установить до 6 шт. (${configuration.ssdU2Count})`)
            }
            if (configuration.cpuCount === 2 && configuration.ssdU2Count > 12) {
                result.errors.push(`SSD U.2 NVMe возможно установить до 12 шт. (${configuration.ssdU2Count})`)
            }
        }

        if (configuration.cpuCount < configuration.ocpCount) {
            result.errors.push(`Количество процессоров (${configuration.cpuCount}) меньше LAN OCP 3.0 (${configuration.ocpCount})`)
        }
        if(configuration.chassis.platform !== 'G4'){

        }else {
            if (configuration.cpuCount === 1) {
                result.warnings.push(`При установке одного процессора ANYBAY бэкплейн работать не будет, возможность устанавливать в переднюю корзину NVMe диски - отсутствовать`)
                if(configuration.pcieCount > 1) {
                    result.errors.push(`Для 1 процессора доступен только 1 PCI-E слот (занято ${configuration.pcieCount})`)
                }
            }
        }
        if (configuration.cpuCount === 2 && configuration.pcieCount > 3 && configuration.chassis.partNumber === 'QSRV-181000') {
            result.errors.push(`Для 2 процессоров доступно только 3 PCI-E слота`)
        }

    }
    let disksAvail = configuration.chassis.disks
        + (
            configuration.chassis.units > 1 ?
                configuration.rearBayAllSFFCount * 2 + configuration.rearBayLFFCount * 2 + configuration.additionalNvmeDisksByBackplane
                : 0
        )
    if (configuration.chassis.partNumber === 'QSRV-260802-E-R') {
        disksAvail = 12
    }

    if(configuration.parts.filter(part => part.component.category === 'CPU').length>1){
        result.errors.push(`Нельзя поставить разные процессоры`)
    }

    if(configuration.parts.filter(part => part.component.category === 'Memory').length>1){
        result.errors.push(`Нельзя поставить разную память`)
    }

    if(!(configuration.diskCount + configuration.ssdM2Count)){
        result.warnings.push('Необходимо выбрать дисковые накопители')
    }

    //console.log(configuration.chassis.disks, configuration.rearBayAllSFFCount * 2 , configuration.rearBayLFFCount * 2 , configuration.additionalNvmeDisksByBackplane)
    if (configuration.diskCount > disksAvail) {
        if (configuration.chassis.partNumber === 'QSRV-463612-E-R') {
            if (configuration.diskSsd25Count > 2) {
                result.errors.push(`Нельзя поставить дисков более (${disksAvail + 2}). Вы пытаетесь поставить (${configuration.diskCount})`)
            }
        } else {
            result.errors.push(`Нельзя поставить дисков более (${disksAvail}). Вы пытаетесь поставить (${configuration.diskCount})`)
        }
    }

    if (configuration.units > 1 && configuration.sasRearBayCount * 2 < ((configuration.sasDiskCount > configuration.chassis.disks) ? configuration.sasDiskCount - configuration.chassis.disks : configuration.sasDiskCount)) {
        //configuration.rearBayNotNVMeSFFCount
        result.errors.push(`Количество SAS дисков превышает возможности SAS корзин`)
    }
    /*
    Вся проверка на удаление
    if (configuration.sataDiskCount > configuration.chassis.disks) {
        result.errors.push(`Количество SATA дисков (${configuration.sataDiskCount}) превышает возможности шасси (${configuration.chassis.disks})`)
    }*/
    if (configuration.diskLFFCount > configuration.chassis.disks + configuration.rearBayLFFCount * 2) {
        //configuration.rearBayNotNVMeSFFCount
        result.errors.push(`Для дополнительного количества LFF дисков (${configuration.diskLFFCount - configuration.chassis.disks}) недостаточное количество LFF корзин (${configuration.rearBayLFFCount})`)
    }


    if (configuration.powerConsumption > configuration.power && configuration.chassis.platform!=='JBOD') {
        result.errors.push(`Недостаточно мощности PSU`)
    }
    if(configuration.chassis.platform==='G4'){
        if(!configuration.ocpCount && !configuration.fcCount && !configuration.lanCount){
            result.warnings.push('В данной конфигурации нет возможности подключить оборудование к сети передачи данных, для подключения к сети добавьте NIC или FC HBA')
        }
    }
    if (configuration.chassis.platform !== 'JBOD') {
        if(!configuration.power ){
            result.errors.push(`Выберите блок питания`)
        }

        if (!configuration.cpuCount) {
            result.errors.push(`Выберите CPU`)
        }
        if (!configuration.memCount) {
            result.errors.push(`Выберите оперативную память`)
        }
        //MEMORY
        if (configuration.memCount > configuration.memMaxCount) {
            result.errors.push(`Выбранное количество модулей памяти (${configuration.memCount}) превышает максимальное (${configuration.memMaxCount})`)
        } else if ((configuration.cpuCount || configuration.memCount) && configuration.cpuCount < 2 && configuration.memCount > (['G3', 'G3R', 'G4'].includes(configuration.chassis.platform) ? 16 : 12)) {
            result.errors.push(`Для выбранного количества модулей памяти (${configuration.memCount}) недостаточно процессоров (${configuration.cpuCount})`)
        }

        //GPU
        if (configuration.gpuCount === 1 && configuration.power < 1300) {
            //result.errors.push(`При установке 1 GPU необходимо питание не менее 1300W. Текущее: ${configuration.power}`)
        }
        const anybayCount = configuration.parts.find(p => p.component.partNumber === 'rbaySFFU2') ? 1 : 0
        const pcieCount = configuration.lan100GBCount + configuration.gpuCount
        if (pcieCount + anybayCount > configuration.riserX16Count) {
            //result.errors.push(`Не хватает слота x16 на райзере для PCI-E устройств (${pcieCount})`)
        }
        if (configuration.gpuCount > 1 && configuration.power < 1600) {
            //result.errors.push(`При установке 2 и более GPU необходимо питание не менее 1600W. Текущее: ${configuration.power}`)
        }

        //REAR BAY
        //configuration.chassis.units * 2 + 1 - configuration.riserCount
        if (configuration.rearBayCount > 4) {
            result.errors.push(`Превышено количество RearBay: ${configuration.rearBayCount}`)
        }
        if (configuration.rearBayAllSFFCount > 2) {
            result.errors.push(`Rearbay SFF (${configuration.rearBayAllSFFCount}) не может быть более двух `)
        }
        if (configuration.rearBayLFFCount > 2) {
            result.errors.push(`Превышено количество SFF rear bay: ${configuration.rearBayLFFCount}`)
        }
        if (['QSRV-260802', 'QSRV-270802', 'QSRV-270812-P-R', 'QSRV-260802-E-R'].includes(configuration.chassis.partNumber) && configuration.raid8iCount > 0 && configuration.rearBaySasSataCount > 0) {
            result.warnings.push(`Rear bay подключен(ы) к SATA PCH контроллеру. Для подключения к RAID контроллеру выберите -16i`)
        }


        //RISER
        const sum = configuration.gpuCount + configuration.lanCount100;
        const needed = sum - configuration.riserX16Count
        if (sum > 2 && needed > 0) {
            result.errors.push(`Сумма LAN 100GbE и GPU не может быть более двух`)
        }
        if (configuration.riserCount > configuration.chassis.units * 2) {
            result.errors.push(`Райзеров нельзя установить более ${configuration.chassis.units * 2} шт`)
        }
        if (configuration.riserCount + configuration.rearBayCount > 4) {
            result.errors.push(`Сумма Riser (${configuration.riserCount}) и RearBay (${configuration.rearBayCount}) не может быть более четырех`)
        }
        if (configuration.cpuCount < 2) {
            const risers = ['2x8riser2U', '2x8riser2Ucab']
            for (const riser of risers) {
                if (configuration.parts.find(p => p.component.partNumber === riser)) {
                    result.errors.push(`При выборе Riser ${riser} требуется установка второго CPU`)
                }
            }
        }

        /*
                if (!configuration.riserCount && configuration.hbaCount) {
                    result.errors.push(`Не хватает слотов на райзере`)
                }
        */
        if (configuration.raidCount > configuration.riserPortsAvailable && configuration.chassis.platform !== 'G2R') {
            if(!(configuration.chassis.units>1 && ['G3','G3R'].includes(configuration.chassis.platform))) {
                result.errors.push(`Количество выбранных RAID (${configuration.raidCount}) превышает количество слотов на всех RISER (${configuration.riserPortsAvailable})`)
            }
        }
        if (configuration.riserMaxCount < configuration.riserCount && configuration.riserCount < 5) {
            result.errors.push(`Количество выбранных Riser (${configuration.riserCount}) больше чем возможно установить (${configuration.riserMaxCount})`)
        }


        if (configuration.riserPort12Count > 2) {
            result.errors.push(`Количество выбранных Riser port 1/2 (${configuration.riserPort12Count}) не может быть более двух`)
        }/* else {
                const oneCpu = (configuration.riserPorts.includes(1) && configuration.riserPorts.includes(3))
                if (!oneCpu && (configuration.cpuCount < configuration.riserCount)) {
                    result.errors.push(`Для выбранного количество райзеров (${configuration.riserCount}) недостаточно процессоров (${configuration.cpuCount})`)
                }
            }*/

        if (configuration.cpuCount === 1) {
            if (configuration.riserPort12Count > 1) {
                if (configuration.chassis.platform === 'G2' && [2, 4].includes(configuration.chassis.units)) {
                    result.warnings.push(`При одном CPU и двух райзерах в port 1 и 2 на райзере в port 2 будет использоваться только первый слот`)
                }
                if (['QSRV-160402-P-R', 'QSRV-160412-P-R', 'QSRV-160802-P-R', 'QSRV-160812-P-R']) {
                    result.errors.push('Недостаточно PCI-e слотов')
                }
                //result.warnings.push(`Для выбранного количество Riser port 1/2 (${configuration.riserPort12Count}) недостаточно процессоров (${configuration.cpuCount})`)
            }
        }

        if (configuration.riserPort3Count > 1) {
            result.errors.push(`Количество выбранных Riser port 3 (${configuration.riserPort3Count}) не может быть более одного`)
        }
        if (configuration.riserPort4Count > 1) {
            result.errors.push(`Количество выбранных Riser port 4 (${configuration.riserPort4Count}) не может быть более одного`)
        }
        if (configuration.riserPort12Count + configuration.rearBayLFFCount > 2) {
            result.errors.push(`Сумма Riser порта 1/2 (${configuration.riserPort12Count}) и RearBay LFF (${configuration.rearBayLFFCount}) не может быть более двух`)
        }
        if (configuration.riserPort3Count + configuration.riserPort4Count + configuration.rearBayAllSFFCount > 2) {
            result.errors.push(`Сумма Riser port 3(${configuration.riserPort3Count}) или port 4(${configuration.riserPort4Count}) и RearBay SFF (${configuration.rearBayAllSFFCount}) не может быть более двух`)
        }
        if (configuration.chassis.partNumber === 'QSRV-260802' && configuration.riserPort12Count > 1 && configuration.anybayCount) {
            result.errors.push(`Можно использовать только один Riser в port 1/2`)
        }


        //PCI-E
        if (configuration.parts.find(p => p.component.partNumber === 'rbaySFFU2') && !configuration.riserX16Count) {
            //result.errors.push(`На каждые дополнительные 2 шт. SSD U.2 NVMe (2) необходим Rear Bay 2*SFF NVMe [rbaySFFU2] (0)`)
        }

        if (configuration.pcieCount > configuration.pcieMaxCount && !['QSRV-260802-E-R'].includes(configuration.chassis.partNumber)) {
            result.errors.push(`Недостаточно PCI-E слотов (${configuration.pcieMaxCount}) для выбранного количества PCI-E устройств (${configuration.pcieCount}) и AnyBay backplane(${configuration.anybayCount})`)
        }

        if (configuration.lanPortsCount < configuration.transceiverCount) {
            result.warnings.push(`Количество SFP модулей и DAC кабелей (${configuration.transceiverCount}) больше чем портов на сетевых картах ${configuration.lanPortsCount}`)
        }

        //STORAGE
        if (['G2','G2R'].includes(configuration.chassis.platform) && configuration.vrocModuleCount && configuration.ssdM2Count >= 2 && !configuration.m2raidCount) {
            result.warnings.push('Без RAID функционала. Для организации RAID на накопителях M.2 NVMe необходимо выбрать M2Raid PCI-E Card for 2*M.2 NVMe RAID 0, 1')
        }
        if (configuration.chassis.isSFF && configuration.diskLFFCount && !configuration.rearBayCount) {
            const text = configuration.chassis.units === 1 ?
                'В данной платформе нельзя установить LFF диски'
                :
                `Для установки LFF дисков нужно добавить заднюю корзину Rear Bay 2*LFF SAS (rbayLFFSAS)`
            result.errors.push(text)
        }
        if (!configuration.raid16ICount && (['QSRV-161002', 'QSRV-171002', 'QSRV-260802', 'QSRV-270802', 'QSRV-270812-P-R'].includes(configuration.chassis.partNumber)
            && (configuration.sasDiskCount === configuration.diskCount && configuration.diskCount > 8))) {
            result.errors.push(`Необходимо использовать HBA/RAID контроллер с 16i линиями`)
        }

        if (configuration.chassis.disks > 11 && configuration.diskSsdHddCount && !configuration.raidCount) {
            result.errors.push(`Для подключения дисков необходимо установить RAID или HBA контроллер`)
        }
        /*
        Закомментировано тк в LFF корзину можно установить SFF диски
        if (!configuration.rearBayNotNVMeSFFCount && (configuration.sffDiskCount > configuration.chassis.disks)) {
            result.errors.push(`Вы пытаетесь установить (${configuration.sffDiskCount}) SFF дисков, без SFF RearBay в шасси можно установить не более (${configuration.chassis.disks})`)
        }*/
        if (configuration.rearBayNotNVMeSFFCount > 2) {
            result.errors.push(`Нельзя установить более двух RearBay SFF. Сейчас установлено (${configuration.rearBayNotNVMeSFFCount})`)
        }
        if (configuration.chassis.isSFF && (configuration.rearBayLFFCount * 2 < configuration.diskLFFCount)) {
            result.errors.push(`Максимальное количество LFF дисков (${configuration.rearBayLFFCount * 2}). Вы пытаетесь установить (${configuration.diskLFFCount}) `)
        }
        if (configuration.chassis.partNumber!=='QSRV-282400' && configuration.chassis.disks > 11 && !configuration.fcCount && !configuration.raidCount && configuration.diskCount > 12) {
            result.errors.push(`Для платформы с количеством дисков более 12 необходим RAID или HBA`)
        }
        if (configuration.isRearBayNeeded) {
            result.errors.push(`Для выбранных SSD U.2 NVMe (${configuration.nvmeCount})  необходимо ${configuration.rearBaysNeeded} Rear bay PN rbaySFFU2 (${configuration.rearBayCount})`)
        }
        /*if (configuration.raid93Count && !configuration.cacheModule93Count) {
            result.errors.push(`93хх серия RAID совместима только с Модуль защиты кэша для RAID 93xx (PN CVM02)`)
        }*/
        if (configuration.cacheModule93Count && (configuration.raid93Count < configuration.cacheModule93Count)) {
            result.errors.push(`Количество модулей защиты (${configuration.cacheModule93Count}) не соответствует количеству RAID 93хх (${configuration.raid93Count})`)
        }
        if (configuration.cacheModule94Count && (configuration.raid94Count < configuration.cacheModule94Count)) {
            result.errors.push(`Количество модулей защиты (${configuration.cacheModule94Count}) не соответствует количеству RAID 94хх (${configuration.raid94Count})`)
        }
        if ((!configuration.raid94Count && configuration.cacheModule94Count) || (!configuration.raid93Count && configuration.cacheModule93Count)) {
            result.errors.push(`Отсутствует соответствующий RAID для установки модуля защиты кэша`)
        }
        if (configuration.cacheModuleCount > configuration.raidCount) {
            result.errors.push(`Количество модулей защиты (${configuration.cacheModuleCount}) не может быть больше количества RAID (${configuration.raidCount}) `)
        }
        if (configuration.vrocModuleCount > 1) {
            result.errors.push(`Количество модулей VROCSTANMOD не может быть более 1 `)
        }
        //console.log(configuration.sasDiskCount , configuration.hbaCount , configuration.raidCount)
        if (configuration.sasDiskCount > 0 && (configuration.hbaCount + configuration.raidCount === 0)) {

            result.errors.push(`Для использования SAS дисков необходимо установить RAID или HBA контроллер`)
        }
        /*if (configuration.raid94Count && !configuration.cacheModule94Count) {
            result.errors.push(`94хх-95xx серия RAID совместима только с Модуль защиты кэша для RAID 94xx-955xx (PN CVPM05)`)
        }*/
        /*if ((configuration.raid94Count + configuration.raid93Count) && configuration.raidTrimodeCount) {
            result.errors.push(`RAID контроллер Trimode 9440 Raid 8i (1,0,10,5,6,50,60) (PN 94008IR) не совместим с модулями защиты. Модули защиты к нему добавлять нельзя`)
        }*/
        if (configuration.chassis.units > 1
            && configuration.ssdU2Count > configuration.additionalNvmeDisksByBackplane
            && (configuration.ssdU2Count - configuration.additionalNvmeDisksByBackplane > configuration.rearBayU2Count * 2)
            && (configuration.ssdU2Count - configuration.U2expnvmeCount * 2 > 0)
        ) {
            if (configuration.chassis.partNumber!=='QSRV-282400' && !configuration.chassis.partNumber.match(/02R$/) && !configuration.backplaneCount) {
                result.errors.push(`На каждые дополнительные 2 шт SSD U.2 NVMe (${configuration.ssdU2Count - configuration.additionalNvmeDisksByBackplane - configuration.U2expnvmeCount * 2}) 
                необходим rear bay rbaySFFU2 (${configuration.rearBayU2Count}) и/или Anybay Backplane`)
            }
        }

        /*if (configuration.additionalNvmeDisksByBackplane && !configuration.trimod16ICount) {
            result.errors.push(`При использовании AnyBay Backplane требуется установить Trimode контроллер с 16i линиями`)
        }*/
        if (configuration.anybayCount && configuration.cpuCount < 2) {
            result.errors.push(`При использовании AnyBay Backplane требуется второй CPU (${configuration.cpuCount})`)
        }

        if (configuration.ssdM2Count > 2) {
            if (!configuration.M2expnvmeCount) {
                result.errors.push(`Нельзя установить более двух SSD m.2 дисков (${configuration.ssdM2Count})`)
            } else {
                if (configuration.nvmeM2DiskCount > configuration.M2expnvmeCount * 2) {
                    result.errors.push(`Количество SSD m.2 NVME (${configuration.nvmeM2DiskCount}) превышает возможности установки с помощью M2expnvme (${configuration.M2expnvmeCount * 2})`)
                }
            }
        }


        if (['260802','270802','270812-P-R', '171012-P-R', '161002', '171002'].map(p=>'QSRV-'+p).includes(configuration.chassis.partNumber)) {
            if(configuration.backplaneCount && !configuration.riserX16Count){
                result.errors.push(`Необходимо добавить райзер x16`)
            }
        }

        if (configuration.chassis.platform === 'G3R') {
            if(configuration.raidCount > configuration.riserCount){
                result.errors.push(`Количество RAID (${configuration.raidCount}) превышает количество RISER (${configuration.riserCount})`)
            }
        }
        //REESTR
        if (configuration.chassis.platform === 'G2R') {
            if (configuration.sataM2DiskCount > 1) {
                result.errors.push(`Можно установить только 1 SSD m.2 SATA`)
            }
            if (configuration.nvmeM2DiskCount > 1 && !configuration.M2expnvmeCount) {
                result.errors.push(`Можно установить только 1 SSD m.2 NVME`)
            }
            if (configuration.cable4U2Count < configuration.ssdU2Count) {
                //result.errors.push(`С каждым диском U.2 NVMe (${configuration.ssdU2Count}) должен быть добавлен кабель (PN 1*SFF-8643 - 1*SFF-8643) (${configuration.cable4U2Count})`)
            }
            if (configuration.cable4U2Count < configuration.ssdU2Count) {
                //result.errors.push(`С каждым диском U.2 NVMe (${configuration.ssdU2Count}) должен быть добавлен кабель (PN 1*SFF-8643 - 1*SFF-8643) (${configuration.cable4U2Count})`)
            }
            if (['QSRV-261202-E-R_Active_BP_wth_4_U2', 'QSRV-262402R_active_BP_wth_4_U2']
                .map(c => c.toLowerCase())
                .includes(configuration.chassis.partNumber.toLowerCase())) {
                if (configuration.ssdU2Count > 4)
                    result.errors.push(`Превышено допустимое (4) количество SSD U.2 NVMe ${configuration.ssdU2Count}`)
                if (!configuration.raidTrimodeCount)
                    result.errors.push(`Необходимо подключение контроллера Trimode`)
                if (configuration.cable8643Count < 5) {
                    //result.errors.push(`Необходимы кабели для подключения 8643 на 8643 ${5 - configuration.cable8643Count} штук`)
                }
            }
            if (['QSRV-361602R_Active_BP', 'QSRV-463602R_Active_BP', 'QSRV-261202-E-R_Active_BP', 'QSRV-262402R_active_BP']
                .map(c => c.toLowerCase())
                .includes(configuration.chassis.partNumber.toLowerCase())
            ) {
                if (!!configuration.sasRaidCount)
                    result.errors.push(`Необходимо подключение контроллера SAS HBA или SAS RAID`)
                const maxCount = 'QSRV-463602R' === configuration.chassis.partnumber ? 4 : 2
                if (configuration.cable8643Count < maxCount) {
                    //result.errors.push(`Необходимы кабели для подключения 8643 на 8643 ${maxCount - configuration.cable8643Count} штук`)
                }
            }
            /*if (['QSRV-262412-E-R'].includes(configuration.chassis.partNumber)){
                const maxPcie = configuration.cpuCount === 2 ? 5 : 3
                if(configuration.pcieCount> maxPcie) {
                    result.errors.push(`PCI-E устройств (${configuration.pcieCount}) больше чем возможно установить (${maxPcie})`)
                }
            }*/
            if (['QSRV-260802-E-R'].includes(configuration.chassis.partNumber)) {
                if (configuration.pcieCount > 3 * configuration.cpuCount) {
                    result.errors.push(`PCI-E устройств (${configuration.pcieCount}) больше чем возможно установить (${3 * configuration.cpuCount})`)
                }
                if (configuration.ssdU2Count) {
                    result.warnings.push(`Требуется TriMode контроллер`)
                    result.warnings.push(`Накопители кабельного подключения не «горячей» замены`)
                }
                if (configuration.ssdU2Count > 2) {
                    result.errors.push(`SSD U.2 NVMe (${configuration.ssdU2Count}) превышает допустимое количество (2)`)
                }
            }
            /*if (['QSRV-261202-E-R', 'QSRV-260802-E-R', 'QSRV-160404R', 'QSRV-160804R']
                .map(c => c.toLowerCase())
                .includes(configuration.chassis.partNumber.toLowerCase())
            ) {
                if (configuration.diskCount > configuration.cableSataCount)
                    //result.errors.push(`Необходимы кабели SATA-SATA (${configuration.diskCount - configuration.cableSataCount})`)
                if (configuration.raidCount * 4 > configuration.cable8643Count) {
                    //result.errors.push(`Необходимы кабели для подключения 8643 на 8643 ${configuration.raidCount * 4 - configuration.cable8643Count} штук`)
                }
            }*/
            if (['QSRV-160402-E-R', 'QSRV-160802-E-R']
                .map(c => c.toLowerCase())
                .includes(configuration.chassis.partNumber.toLowerCase())
            ) {
                if (configuration.sataM2DiskCount > 1)
                    result.errors.push(`Только 1 SSD m.2 SATA диск может быть установлен (${configuration.sataM2DiskCount})`)
                if (configuration.nvmeM2DiskCount > 1 && !configuration.M2expnvmeCount)
                    result.errors.push(`Только 1 SSD m.2 NVMe диск может быть установлен (${configuration.nvmeM2DiskCount})`)
            }
            if (configuration.chassis.partNumber === 'QSRV-463612-E-R') {
                if (!configuration.raidCount) result.errors.push(`Выберите RAID контроллер`)
                if (configuration.raid8iCount && configuration.raid8iCount < 2) result.warnings.push(`28 накопителей могут будь подключены к RAID контроллеру`)
            }
        }
    }
    return result
}
