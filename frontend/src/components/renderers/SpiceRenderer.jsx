import { Cpu } from 'lucide-react';

const SpiceRenderer = ({ content }) => {
    // A simple illustrative parser for basic SPICE netlist for MVP
    // Real SPICE rendering would require a full library like Schematics.js or server-side rendering

    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    const components = lines.map(line => {
        // Basic SPICE format: Name Node1 Node2 Value
        // e.g., R1 1 0 10k
        //       V1 1 0 5V
        const parts = line.split(/\s+/);
        if (parts.length >= 4) {
            const typeStr = parts[0][0].toUpperCase();
            let icon = '📦';
            let typeName = 'Component';

            switch (typeStr) {
                case 'R': icon = '⚡'; typeName = 'Resistor'; break;
                case 'C': icon = '⏸️'; typeName = 'Capacitor'; break;
                case 'L': icon = '➰'; typeName = 'Inductor'; break;
                case 'V': icon = '🔋'; typeName = 'Voltage Source'; break;
                case 'I': icon = '🔌'; typeName = 'Current Source'; break;
                case 'D': icon = '▶️'; typeName = 'Diode'; break;
                case 'Q': icon = '🎛️'; typeName = 'Transistor (BJT)'; break;
                case 'M': icon = '🛠️'; typeName = 'MOSFET'; break;
            }
            return {
                original: line,
                name: parts[0],
                node1: parts[1],
                node2: parts[2],
                value: parts[3],
                icon,
                typeName
            };
        }
        return { original: line, typeName: 'Directive/Comment' };
    });

    return (
        <div className="my-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 font-sans">
            <div className="bg-slate-800 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
                <Cpu size={16} /> Circuit Visualization (SPICE Netlist)
            </div>
            <div className="p-4 flex flex-col md:flex-row gap-6">

                {/* Raw Netlist View */}
                <div className="flex-1 bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto shadow-inner">
                    {lines.map((l, i) => (
                        <div key={i} className="hover:bg-slate-800 px-1 rounded transition-colors whitespace-nowrap">
                            <span className="text-slate-500 mr-4 select-none">{i + 1}</span>{l}
                        </div>
                    ))}
                </div>

                {/* Abstract Component View */}
                <div className="flex-1 space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {components.map((comp, idx) => (
                        comp.name ? (
                            <div key={idx} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex items-center justify-between hover:border-primary-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                                        {comp.icon}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{comp.name} <span className="text-xs font-normal text-slate-500">({comp.typeName})</span></div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                                            Nodes: [{comp.node1}] ↔ [{comp.node2}]
                                        </div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded">
                                    {comp.value}
                                </div>
                            </div>
                        ) : (
                            <div key={idx} className="text-xs text-slate-400 italic px-2">
                                {comp.original}
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SpiceRenderer;
