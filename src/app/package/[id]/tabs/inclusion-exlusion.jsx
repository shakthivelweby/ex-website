import Accordion from "@/components/Accordion";

const InclusionExlusionTab = ({ packageData, activeTab }) => {
  const { detailed_inclusions, exclusions, things_to_carry } = packageData.data;
  return (
    <div
      className={`prose max-w-none text-gray-800 ${
        activeTab === "inclusion" ? "block" : "hidden"
      }`}
    >
      <Accordion title="Included Services" defaultOpen={true}>
        <ul className="space-y-3 m-0">
          {detailed_inclusions &&
            detailed_inclusions.map((inclusion) => {
              if (inclusion.description === "") {
                return null;
              }
              return (
                <li className="flex items-center" key={inclusion.id}>
                  <i className="fi fi-rr-check-circle text-green-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                  <span className="text-gray-800">{inclusion.description}</span>
                </li>
              );
            })}
        </ul>
      </Accordion>

      <Accordion title="Excluded Services" defaultOpen={false}>
        <ul className="space-y-3 m-0">
          {exclusions &&
            exclusions.map((exclusion) => {
              if (exclusion.description === "") {
                return null;
              }
              return (
                <li className="flex items-center" key={exclusion.id}>
                  <i className="fi fi-rr-cross-circle text-red-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                  <span className="text-gray-800">{exclusion.description}</span>
                </li>
              );
            })}
        </ul>
      </Accordion>

      <Accordion title="Things to Carry" defaultOpen={false}>
        <ul className="space-y-3 m-0">
          {things_to_carry &&
            things_to_carry.map((thing) => {
              if (thing.description === "") {
                return null;
              }
              return (
                <li className="flex items-center" key={thing.id}>
                  <i className="fi fi-rr-check-circle text-sky-500 text-base mt-0.5 mr-3 flex-shrink-0"></i>
                  <span className="text-gray-800">{thing.description}</span>
                </li>
              );
            })}
        </ul>
      </Accordion>
    </div>
  );
};

export default InclusionExlusionTab;
