type WorkspaceContentProps = {
  onContinue: () => void;
};

export default function WorkspaceContent({
  onContinue,
}: WorkspaceContentProps) {
  return (
    <div className="help-content">
      <div className="employee-heading">
        <span className="workspace-symbol">
          П
        </span>

        <div>
          <h2>Демо-компания</h2>
          <p>Пространство команды</p>
        </div>
      </div>

      <p>
        Вы находитесь в демонстрационном
        пространстве. Данные условные,
        роли показаны только для контекста,
        реального разграничения прав нет.
      </p>

      <button
        className="btn primary"
        onClick={onContinue}
      >
        Продолжить работу
      </button>
    </div>
  );
}
