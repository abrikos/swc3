export default function (conf: IConf) {
    return !['JBOD'].includes(conf.chassis.platform) ? [
        //{id: 'base', label: 'Основа'},

        {name: 'CPU'},
        {name: 'Memory',},
        {
            name: 'Storage',
            children: [
                {name: 'Backplane'},
                {name: 'RAID'},
                {name: 'HDD'},
                {name: 'SSD 2.5'},
                {name: 'SSD m.2'},
                {name: 'SSD U.2 NVMe'},
                {name: 'Rear bay'},
                //{name: 'Cable'},

            ]
        },
        {name: 'Riser',},
        {
            name: 'PCI-E',
            children: [
                {name: 'LAN OCP 3.0'},
                {name: 'LAN'},
                {name: 'FC'},
                {name: 'GPU'},
                {name: 'Transceiver'},
            ]
        },
        {name: 'Power'},
        {name: 'Cables'},
        {name: 'Services'},
        {name: 'Soft'},
    ] : [{
        name: 'Storage',
        children: [
            {name: 'HDD'},
            {name: 'SSD 2.5'},

        ]
    }, {name: 'Cables'},{name: 'Services'},]
}