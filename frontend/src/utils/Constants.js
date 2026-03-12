export const APP_CONFIG = {
    brandName: 'Swastik Gold & Silver Lab',
    shortName: 'SWASTIK',
    version: 'v2.0 Enterprise',
    companyLogo: '/assets/logo.png', // Or however Logo is stored 
    copyright: `© ${new Date().getFullYear()} Swastik Lab & Testing Center`,

    // Core Lab Variables
    roles: {
        ADMIN: 'admin',
        LAB_TECH: 'lab',
        FRONT_DESK: 'front_desk'
    },

    // Workflow Tabs Constants
    workflows: [
        { id: 'gold', label: 'Gold Test', icon: 'FaGem', type: 'GT' },
        { id: 'silver', label: 'Silver Test', icon: 'FaCheckDouble', type: 'ST' },
        { id: 'gold_cert', label: 'Gold Cert', icon: 'FaCertificate', type: 'GC' },
        { id: 'silver_cert', label: 'Silver Cert', icon: 'FaCertificate', type: 'SC' },
        { id: 'photo_cert', label: 'Photo Cert', icon: 'FaCertificate', type: 'PC' }
    ]
};
