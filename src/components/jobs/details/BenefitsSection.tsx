import { Card, CardContent } from '../../ui/card';

interface BenefitsSectionProps {
  benefits?: string[];
}

export function BenefitsSection({ benefits }: Readonly<BenefitsSectionProps>) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits & Perks</h3>
        {benefits?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {benefits.map((benefit) => (
              <div key={`benefit-${benefit}`} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">No benefits listed.</p>
        )}
      </CardContent>
    </Card>
  );
}
